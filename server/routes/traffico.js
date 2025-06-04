const express = require('express');
const router = express.Router();
require('dotenv').config();

// GET /api/traffico - Ottiene dati traffico per Trento
router.get('/', async (req, res) => {
    try {
        const API_KEY = process.env.OPENROUTE_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ 
                error: 'API Key OpenRouteService non configurata' 
            });
        }

        // Definiamo punti chiave di Trento
        const keyPoints = {
            centro: { name: "Centro", coords: [11.121, 46.0748] },
            stazione: { name: "Stazione", coords: [11.1197, 46.0632] },
            universita: { name: "Università", coords: [11.1508, 46.0679] },
            povo: { name: "Povo", coords: [11.1506, 46.0630] },
            mattarello: { name: "Mattarello", coords: [11.1089, 46.0272] },
            ospedale: { name: "Ospedale Santa Chiara", coords: [11.132803, 46.057658] },
            prova: { name: "Prova", coords: [11.134235, 46.123823] }
        };

        // Definiamo le tratte specifiche (strade/percorsi principali)
        const predefinedRoutes = [
            // Tratte principali del centro
            { from: "centro", to: "stazione", name: "Centro - Stazione" },
            { from: "centro", to: "universita", name: "Centro - Università" },
            { from: "centro", to: "ospedale", name: "Centro - Ospedale" },
            
            // Tratte verso le periferie
            { from: "stazione", to: "mattarello", name: "Stazione - Mattarello" },
            { from: "universita", to: "povo", name: "Università - Povo" },
            
            // Altre tratte importanti
            { from: "ospedale", to: "universita", name: "Ospedale - Università" },
            { from: "centro", to: "prova", name: "Centro - Prova" },
            
            // Aggiungere altre tratte secondo necessità
            // { from: "punto1", to: "punto2", name: "Nome della tratta" }
        ];

        const trafficData = [];

        // Calcoliamo il traffico solo per le tratte predefinite
        for (const route of predefinedRoutes) {
            const startPoint = keyPoints[route.from];
            const endPoint = keyPoints[route.to];
            
            if (!startPoint || !endPoint) {
                console.error(`Punto non trovato per la tratta: ${route.name}`);
                continue;
            }
            
            try {
                const response = await fetch(
                    `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startPoint.coords[0]},${startPoint.coords[1]}&end=${endPoint.coords[0]},${endPoint.coords[1]}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    const routeData = data.features[0];
                    
                    if (routeData && routeData.properties) {
                        const duration = routeData.properties.summary.duration; // in secondi
                        const distance = routeData.properties.summary.distance; // in metri
                        const avgSpeed = (distance / 1000) / (duration / 3600); // km/h
                        
                        // Classifichiamo il traffico in base alla velocità media
                        let trafficLevel = 'green';
                        if (avgSpeed < 20) trafficLevel = 'red';
                        else if (avgSpeed < 35) trafficLevel = 'yellow';
                        
                        trafficData.push({
                            routeName: route.name,
                            from: startPoint.name,
                            to: endPoint.name,
                            fromCoords: startPoint.coords,
                            toCoords: endPoint.coords,
                            coordinates: routeData.geometry.coordinates,
                            duration: Math.round(duration / 60), // minuti
                            distance: Math.round(distance / 1000 * 100) / 100, // km
                            avgSpeed: Math.round(avgSpeed),
                            trafficLevel: trafficLevel,
                            timestamp: new Date().toISOString()
                        });
                    }
                } else {
                    console.error(`Errore API per la tratta ${route.name}:`, response.status);
                }
            } catch (error) {
                console.error(`Errore nel calcolo percorso ${route.name}:`, error);
            }
            
            // Piccola pausa per non sovraccaricare l'API
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        res.json({
            success: true,
            city: 'Trento',
            lastUpdate: new Date().toISOString(),
            trafficData: trafficData,
            summary: {
                totalRoutes: trafficData.length,
                greenRoutes: trafficData.filter(r => r.trafficLevel === 'green').length,
                yellowRoutes: trafficData.filter(r => r.trafficLevel === 'yellow').length,
                redRoutes: trafficData.filter(r => r.trafficLevel === 'red').length
            }
        });

    } catch (error) {
        console.error('Errore nel recupero dati traffico:', error);
        res.status(500).json({ 
            error: 'Errore interno del server',
            details: error.message 
        });
    }
});

module.exports = router;