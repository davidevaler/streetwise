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
            viaDruso: { name: "Via Druso", coords: [11.113960, 46.076978] },
            viaPetrarca: { name: "Via Petrarca", coords: [11.123882, 46.072696] },

            stazione: { name: "Stazione dei Treni", coords: [11.120092, 46.072511] },
            viaRosminiNS: { name: "Via Rosmini (da NORD verso SUD)", coords: [11.119412, 46.064656] },
            viaRosminiSN: { name: "Via Rosmini (da SUD verso NORD)", coords: [11.119517, 46.064596] },
            viaTorreVerde: { name: "Via Torre Verde", coords: [11.124704, 46.072024] },

            viaDeiVentuno: { name: "Via dei Ventuno", coords: [11.127372, 46.069159] },
            viaRomagnosi: { name: "Via Romagnosi", coords: [11.121210, 46.073404] },
            
            viaPilati: { name: "Via Pilati", coords: [11.1261775, 46.0663] },
            viaPiave: { name: "Via Piave", coords: [11.1280889, 46.0649045] },
            corso3Novembre: { name: "Corso 3 Novembre", coords: [11.1239674, 46.0618610] },

            vialeVeronaNord: { name: "Viale Verona Nord", coords: [11.127673, 46.058231] },
            vialeVeronaSud: { name: "Viale Verona Sud", coords: [11.131125, 46.042258] },

            tangenzialeVersoSud1: { name: "Tangenziale Nord (da NORD a SUD) 1", coords: [11.1227654, 46.0909793] },
            tangenzialeVersoNord1: { name: "Tangenziale Sud (da SUD a NORD) 1", coords: [11.1152358, 45.9800389] },
            
            tangenzialeVersoSud2: { name: "Tangenziale Nord (da NORD a SUD) 2", coords: [11.109934, 46.095506] },
            tangenzialeVersoSud3: { name: "Tangenziale (da NORD a SUD) 3", coords: [11.1045565, 46.0940308] },
            tangenzialeVersoSud4: { name: "Tangenziale (da NORD a SUD) 4", coords: [11.1023270, 46.0911030] },
            tangenzialeVersoSud5: { name: "Tangenziale (da NORD a SUD) 5", coords: [11.1104551, 46.0843077] },
            tangenzialeVersoSud6: { name: "Tangenziale (da NORD a SUD) 6", coords: [11.1123051, 46.0791315] },
            tangenzialeVersoSud7: { name: "Tangenziale (da NORD a SUD) 7", coords: [11.112262, 46.074572] },
            tangenzialeVersoSud8: { name: "Tangenziale (da NORD a SUD) 8", coords: [11.1109312, 46.0666602] },
            tangenzialeVersoSud9: { name: "Tangenziale (da NORD a SUD) 9", coords: [11.1122769, 46.0523560] },
            tangenzialeVersoSud10: { name: "Tangenziale (da NORD a SUD) 10", coords: [11.1175009, 46.0439169] },
            tangenzialeVersoSud11: { name: "Tangenziale (da NORD a SUD) 11", coords: [11.1250966, 46.0363336] },
            tangenzialeVersoSud12: { name: "Tangenziale (da NORD a SUD) 12", coords: [11.1257121, 46.0115092] },
        
            tangenzialeVersoNord2: { name: "Tangenziale (da SUD a NORD) 2", coords: [11.125981, 46.011833] },
            tangenzialeVersoNord3: { name: "Tangenziale (da SUD a NORD) 3", coords: [11.1271743, 46.0328580] },
            tangenzialeVersoNord4: { name: "Tangenziale (da SUD a NORD) 4", coords: [11.1175917, 46.0439460] },
            tangenzialeVersoNord5: { name: "Tangenziale (da SUD a NORD) 5", coords: [11.1128030, 46.0504606] },
            tangenzialeVersoNord6: { name: "Tangenziale (da SUD a NORD) 6", coords: [11.1114616, 46.0651697] },
            tangenzialeVersoNord7: { name: "Tangenziale (da SUD a NORD) 7", coords: [11.1126568, 46.0755321] },
            tangenzialeVersoNord8: { name: "Tangenziale (da SUD a NORD) 8", coords: [11.1098056, 46.0847591] },
            tangenzialeVersoNord9: { name: "Tangenziale (da SUD a NORD) 9", coords: [11.1022897, 46.0915358] },
            tangenzialeVersoNord10: { name: "Tangenziale (da SUD a NORD) 10", coords: [11.114977, 46.096315] },

            tangenzialeVersoSudLast: { name: "Tangenziale Sud (da NORD a SUD) Last", coords: [11.1151415, 45.9798952] },
            tangenzialeVersoNordLast: { name: "Tangenziale Nord (da SUD a NORD) Last", coords: [11.1230628, 46.0903971] },


            piazzaVeneziaNord: { name: "Piazza Venezia Nord", coords: [11.127852, 46.069873] },
            piazzaVeneziaSud: { name: "Piazza Venezia Sud", coords: [11.126625, 46.067397] },

            viaVenezia1: { name: "Inizio via Venezia", coords: [11.139510, 46.069950] },
            viaVenezia2: { name: "Fine via Venezia", coords: [11.128457, 46.069714] },

            lavis: { name: "Lavis", coords: [11.111122, 46.133799] },
            viaBrennero1SN: { name: "Via Brennero (da SUD a NORD)", coords: [11.106753, 46.114540] },
            viaBrennero1NS: { name: "Via Brennero (da NORD a SUD)", coords: [11.106537, 46.114516] },
            viaBrenneroNordSN: { name: "Via Brennero Nord (da SUD a NORD)", coords: [11.106991, 46.113677] },
            viaBrenneroSudSN: { name: "Via Brennero Sud (da SUD a NORD)", coords: [11.123661, 46.077285] },
            viaBrenneroNordNS: { name: "Via Brennero Nord (da NORD a SUD)", coords: [11.106849, 46.113596] },
            viaBrenneroSudNS: { name: "Via Brennero Sud (da NORD a SUD)", coords: [11.123497, 46.077412] },

            viaSanFrancesco: { name: "Via San Francesco", coords: [11.126372, 46.067105] },
            viaBarbacovi: { name: "Via Barbacovi", coords: [11.131207, 46.064342] },
            viaGrazioli: { name: "Via Grazioli", coords: [11.127731, 46.067310] },

            viaPerini1: { name: "Inizio Via Perini", coords: [11.124694, 46.060928] },
            viaPerini2: { name: "Fine Via Perini", coords: [11.119178, 46.059879] },

            viaGocciadoro1: { name: "Inizio Via Gocciadoro", coords: [11.127684, 46.058338] },
            viaGocciadoro2: { name: "Fine Via Gocciadoro", coords: [11.133120, 46.055126] },

            viaOrsi: { name: "Via Orsi", coords: [11.131303, 46.056515] },
            viaPasubio: { name: "Via Pasubio", coords: [11.133624, 46.061679] },
        };

        // Definiamo le tratte specifiche (strade/percorsi principali)
        const predefinedRoutes = [
            { from: "stazione", to: "viaRosminiNS", name: "Stazione - via Rosmini" },
            { from: "viaRosminiSN", to: "viaTorreVerde", name: "Via Rosmini - Torre Verde" },
            { from: "viaDeiVentuno", to: "viaRomagnosi", name: "Via dei Ventuno - Romagnosi" },
            { from: "vialeVeronaSud", to: "vialeVeronaNord", name: "Viale Verona" },
            { from: "piazzaVeneziaNord", to: "piazzaVeneziaSud", name: "Piazza Venezia" },
            { from: "viaVenezia1", to: "viaVenezia2", name: "Via Venezia" },

            { from: "viaBrenneroSudSN", to: "viaBrenneroNordSN", name: "Via Brennero da Sud a Nord" },
            { from: "viaBrenneroNordNS", to: "viaBrenneroSudNS", name: "Via Brennero da Nord a Sud" },
            { from: "viaBrenneroSudSN", to: "stazione", name: "Via Brennero Sud - Stazione" },
            { from: "viaBrennero1SN", to: "lavis", name: "Via Brennero da Sud a Nord" },
            { from: "lavis", to: "viaBrennero1NS", name: "Via Brennero da Nord a Sud" },
            
            { from: "viaBrenneroNordSN", to: "viaBrennero1SN", name: "Rotatoria Bermax" },
            { from: "viaBrennero1SN", to: "viaBrenneroNordNS", name: "Rotatoria Bermax" },

            { from: "viaDruso", to: "viaPetrarca", name: "Via Druso - Via Petrarca" },
            { from: "vialeVeronaNord", to: "corso3Novembre", name: "Corso 3 Novembre" },
            { from: "corso3Novembre", to: "viaPiave", name: "Via Piave" },
            { from: "viaPiave", to: "viaPilati", name: "Via Brigata Acqui - Via Pilati" },
            { from: "tangenzialeVersoSud1", to: "tangenzialeVersoSud2", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud2", to: "tangenzialeVersoSud3", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud3", to: "tangenzialeVersoSud4", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud4", to: "tangenzialeVersoSud5", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud5", to: "tangenzialeVersoSud6", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud6", to: "tangenzialeVersoSud7", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud7", to: "tangenzialeVersoSud8", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud8", to: "tangenzialeVersoSud9", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud9", to: "tangenzialeVersoSud10", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud10", to: "tangenzialeVersoSud11", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud11", to: "tangenzialeVersoSud12", name: "Tangenziale da Nord a Sud" },
            { from: "tangenzialeVersoSud12", to: "tangenzialeVersoSudLast", name: "Tangenziale da Nord a Sud" },
            
            

            { from: "tangenzialeVersoNord1", to: "tangenzialeVersoNord2", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord2", to: "tangenzialeVersoNord3", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord3", to: "tangenzialeVersoNord4", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord4", to: "tangenzialeVersoNord5", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord5", to: "tangenzialeVersoNord6", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord6", to: "tangenzialeVersoNord7", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord7", to: "tangenzialeVersoNord8", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord8", to: "tangenzialeVersoNord9", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord9", to: "tangenzialeVersoNord10", name: "Tangenziale da Sud a Nord" },
            { from: "tangenzialeVersoNord10", to: "tangenzialeVersoNordLast", name: "Tangenziale da Sud a Nord" },

            { from: "viaSanFrancesco", to: "viaBarbacovi", name: "Via San Francesco - Via Barbacovi" },
            { from: "viaBarbacovi", to: "viaGrazioli", name: "Via Giovanelli - Via Grazioli" },
            { from: "viaPerini1", to: "viaPerini2", name: "Via Perini" },
            { from: "viaGocciadoro1", to: "viaGocciadoro2", name: "Via Gocciadoro" },
            { from: "viaOrsi", to: "viaPasubio", name: "Via Orsi - Via Pasubio" },
            { from: "viaPasubio", to: "viaBarbacovi", name: "Via Pasubio - Via Barbacovi" },
            


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
            //await new Promise(resolve => setTimeout(resolve, 300));
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