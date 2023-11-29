//require necessary modules
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
var Storage = require('node-storage');
const fs = require('fs');

//use node storage, link to json
var store = new Storage('../server/db.json');

//Create express application and assign port
const app = express();
const port = 8000;

//require the json files given in data
const heroInfo = require('./superhero_info.json');
const heroPower = require('./superhero_powers.json');

//use json format
app.use(express.json());
app.use(cors());

// //Generate secret key for JWT
// const generateSecretKey = () => {
//     return crypto.randomBytes(32).toString('hex'); // 32 bytes converted to a hexadecimal string
// };
// const secretKey = generateSecretKey();

// // Function to generate a JWT token
// function generateToken(email) {
//     return jwt.sign({ email }, secretKey, { expiresIn: '1h' }); // Token expires in 1 hour
// }

// // Middleware to verify the JWT token
// function verifyToken(req, res, next) {
//     const token = req.header('Authorization');
//     if (!token) return res.status(401).send('Access Denied');

//     try {
//         const verified = jwt.verify(token, secretKey);
//         req.user = verified;
//         next();
//     } catch (err) {
//         res.status(400).send('Invalid Token');
//     }
// }

//middleware for logging
app.use((req,res,next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Get all supeheroes
app.get('/api/hero',(req, res) => {
    res.send(heroInfo);
});

// Get all superhero powers
app.get('/api/hero_power', (req, res) => {
    res.send(heroPower);
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

    if (name) {
        if (power_object) {
            const hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
            res.json(hero_powers);
        } else {
            res.json(['-']);
        }
    } else {
        res.status(404).send(`Hero ${id} was not found!`);
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

//Get first n number of heros matching field and pattern
app.get('/api/hero_pattern/:field/:pattern/:n?', (req, res) => {
    const field = req.params.field;
    const pattern = req.params.pattern.toLowerCase();
    let n = Number(req.params.n);
    if (isNaN(n)) {
        n = Infinity;
    }

    if (!heroInfo[0].hasOwnProperty(field)) {
        res.status(400).json({ message: `${field} does not exist!` });
    }

    const matching_heroID = []
    heroInfo.forEach((hero) => {
        if (matching_heroID.length < n) {
            if (hero[field].toLowerCase().startsWith(pattern)) {
                matching_heroID.push(hero.id);
            }
        }
    });

    if (matching_heroID.length) {
        res.json(matching_heroID);
    } else {
        res.status(404).json({ message: `${pattern} not found!` });
    }
});

//Get all list names stored
app.get('/api/hero_db_names', (req, res) => {
    fs.readFile('server/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal server error' });
        } else {
            const dataDb = JSON.parse(data);
            const names = Object.keys(dataDb);
            res.json(names);
        }
    });
});

//Get hero ID based on listName
app.get('/api/hero_db_id/:listName',(req, res) => {
    const listName = req.params.listName;
    const all_heroes = store.get(listName);
    if (all_heroes === null || all_heroes === undefined) {
        res.status(400).json({
            list_name:null,
            list_id:null,
            message: `List "${listName}" does not exist.`
        });

    } else {
        const all_hero_id = Object.keys(all_heroes).map(key => parseInt(key, 10));
        res.json({
            list_name: listName,
            list_id: all_hero_id,
            message: null
        });
    }
});

//Get hero info based on listName
app.get('/api/hero_db/:listName',(req, res) => {
    const listName = req.params.listName;
    const all_heroes = store.get(listName);
    if (all_heroes === null || all_heroes === undefined) {
        res.status(400).send(`List "${listName}" does not exist.`);
    } else {
        res.send(all_heroes);
    }
});

//Post to create a new list
app.post('/api/hero_db_create', (req, res) => {
    const list = req.body;
    const list_name = list.list_name;
    if (store.get(list_name) === null || store.get(list_name) === undefined) {
        store.put(list_name, {});
        res.send(`List ${list_name} was added`);
    } else {
        res.status(409).send(`List ${list_name} conflicts (already exists)`);
    }
});

//Post to add hero IDs and info to a list
app.post('/api/hero_db_add', (req, res) => {
    const list_name = req.body.list_name;
    const ids = req.body.list_ids;
    let heroNotFoundFlag = false;

    if (store.get(list_name) === null || store.get(list_name) === undefined) {
        res.status(400).json({message:`List ${list_name} does not exist!`});
    } else {
        for (id of ids) {
            const hero = heroInfo.find(h => h.id === parseInt(id));
            if (hero) {
                const power_object = heroPower.find(h => h.hero_names === hero.name);
    
                if (power_object) {
                    var hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
                } else {
                   hero_powers = '-';
                }
    
                store.put(`${list_name}.${id}`,hero);
                store.put(`${list_name}.${id}.Power`,hero_powers);
    
            } else {
                res.status(404).json({message:`Hero ${id} was not found!`});
                heroNotFoundFlag=true;
                break;
            }
        }
        if (!heroNotFoundFlag) {
            res.send(`Successfully added ${ids} to ${list_name}`);
        }
    }
});

//Post to delete a list
app.post('/api/hero_db_delete', (req, res) => {
    const list = req.body;
    const list_name = list.list_name;
    if (store.get(list_name) === null || store.get(list_name) === undefined) {
        res.status(400).send(`List ${list_name} does not exist!`);
    } else {
        store.remove(list_name);
        res.send(`List ${list_name} was deleted`);
    }
});


//hash password function to hash using scrypt and salt
async function hash(password) {
    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(8).toString("hex")

        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(salt + ":" + derivedKey.toString('hex'))
        });
    });
}

//verify hashed password
async function verify(password, hash) {
    return new Promise((resolve, reject) => {
        const [salt, key] = hash.split(":")
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key == derivedKey.toString('hex'))
        });
    });
}


//Post to create account in the database
app.post('/account/create_account',async (req,res) => {
    const account = req.body;
    const email = String(account.email);
    const password = String(account.password);
    const nickname = String(account.nickname);

    const hashed_pasword = await hash(password);

    if (store.get(email) === null || store.get(email) === undefined) {
        store.put(email,{"nickname":nickname,"password":hashed_pasword})
        const token = generateToken(email);
        res.send(`This account ${email} has been created.`);
    } else {
        res.status(409).send(`This account ${email} already exists. Please Log In.`);
    }
});

//Post to update password
app.post('/account/update_password', async (req,res) => {
    const account = req.body;
    const email = String(account.email);
    const old_password = String(account.old_password);
    const new_password = String(account.new_password);

    const stored_account = store.get(email);

    if (stored_account === null || stored_account === undefined) {
        res.status(404).send(`This account ${email} does not exist!`)
    } else {
        // Verify old password using the stored hashed password
        const is_password_valid = await verify(old_password, stored_account.password);

        if (is_password_valid) {
            const new_hashed_password = await hash(new_password);
            stored_account.password = new_hashed_password;
            store.put(email,stored_account); 
            res.send(`The account ${email}'s passowrd has been updated.`);
        } else {
            res.status(401).send(`The password you have enterred is incorrect`);
        }
    }
});










//Listen for requests on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});