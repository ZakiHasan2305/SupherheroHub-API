const express = require('express');
const app = express();
const port = 3000;
const router = express.Router();

const heroInfo = require('./superhero_info.json');
const heroPower = require('./superhero_powers.json');

//set-up front end
app.use('/', express.static('client'));

//middleware for logging
app.use((req,res,next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Get all superhero information for a given ID
app.get('/api/hero/:hero_id', (req, res) => {
    const id = req.params.hero_id;
    const hero = heroInfo.find(h => h.id === parseInt(id));
    if (hero) {
        res.send(hero);
    } else {
        res.status(404).send(`Hero ${id} was not found!`);
    }
});

// Get all powers for a given superhero ID
app.get('/api/hero_power/:hero_id', (req,res) => {
    const id = req.params.hero_id;
    const name = heroInfo.find(h => h.id === parseInt(id)).name;
    const power_object = heroPower.find(h => h.hero_names === name);

    if (power_object) {
        const hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
        console.log(`Powers of ${id}: ${hero_powers}`);
        res.send(hero_powers);
    } else {
        if (name) {
            res.status(404).send(`Hero ${id} has no powers!`);
        } else {
            res.status(404).send(`Hero ${id} was not found!`);
        }
    }
});

// Get all available publisher names
app.get('/api/hero_publisher', (req, res) => {
    const publishers_set = new Set();
    heroInfo.forEach((hero) => {
        publishers_set.add(hero.Publisher);
    });
    res.json(Array.from(publishers_set));
});


// Get all supehero
app.get('/api/hero',(req, res) => {
    res.send(heroInfo)
});

// Get all superhero powers
app.get('/api/hero_power', (req, res) => {
    res.send(heroPower)
});

//Start api
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});