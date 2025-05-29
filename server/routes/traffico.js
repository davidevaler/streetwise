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

        // Coordinate per la città di Trento (bounding box)
        const bbox = [11.00, 45.96, 11.24, 46.16]; // [west, south, east, north]
        
        // Utilizziamo l'API di OpenRouteService per ottenere informazioni sul traffico
        // Nota: OpenRouteService non ha un endpoint specifico per traffico real-time
        // ma possiamo usare l'API di routing per calcolare tempi di percorrenza attuali
        
        // Definiamo alcuni punti chiave di Trento per calcolare i tempi di percorrenza
        const keyPoints = [
            { name: "Centro", coords: [11.121, 46.0748] },
            { name: "Stazione", coords: [11.1197, 46.0632] },
            { name: "Università", coords: [11.1508, 46.0679] },
            { name: "Povo", coords: [11.1506, 46.0630] },
            { name: "Mattarello", coords: [11.1089, 46.0272] },
            { name: "Ospedale Santa Chiara", coords: [11.132803, 46.057658] },
            { name: "Prova", coords: [11.134235, 46.123823] }
        ];

        const trafficData = [];

        // Calcoliamo percorsi tra punti chiave per stimare il traffico
        for (let i = 0; i < keyPoints.length - 1; i++) {
            for (let j = i + 1; j < keyPoints.length; j++) {
                const start = keyPoints[i];
                const end = keyPoints[j];
                
                try {
                    const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start.coords[0]},${start.coords[1]}&end=${end.coords[0]},${end.coords[1]}`);
                    
                    if (response.ok) {
                        const data = await response.json();
                        const route = data.features[0];
                        
                        if (route && route.properties) {
                            const duration = route.properties.summary.duration; // in secondi
                            const distance = route.properties.summary.distance; // in metri
                            const avgSpeed = (distance / 1000) / (duration / 3600); // km/h
                            
                            // Classifichiamo il traffico in base alla velocità media
                            let trafficLevel = 'green';
                            if (avgSpeed < 20) trafficLevel = 'red';
                            else if (avgSpeed < 35) trafficLevel = 'yellow';
                            
                            trafficData.push({
                                from: start.name,
                                to: end.name,
                                coordinates: route.geometry.coordinates,
                                duration: Math.round(duration / 60), // minuti
                                distance: Math.round(distance / 1000 * 100) / 100, // km
                                avgSpeed: Math.round(avgSpeed),
                                trafficLevel: trafficLevel,
                                timestamp: new Date().toISOString()
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Errore nel calcolo percorso ${start.name} -> ${end.name}:`, error);
                }
                
                // Piccola pausa per non sovraccaricare l'API
                await new Promise(resolve => setTimeout(resolve, 100));
            }
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