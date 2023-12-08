//require necessary modules
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const stringSimilarity = require('string-similarity');

const config = require('./config');
const secretKey = config.secretKey;

//connect to database
require('dotenv').config();
const mongoString = process.env.DATABASE_URL
mongoose.connect(mongoString);
const database = mongoose.connection;
const Model = require('./model.js');

//Create express application and assign port
const app = express();
const port = 8000;

//require the json files given in data
const heroInfo = require('./superhero_info.json');
const heroPower = require('./superhero_powers.json');

//use json format
app.use(express.json());
app.use(cors());

//check if database is connected
database.on('error', (error) => {console.log(error);})
database.once('connected', () => {console.log('Database Connected');})

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

// // Updated search function for name, race, publisher, and power
// app.get('/api/search', (req, res) => {
//     const name = req.query.name ? req.query.name.toLowerCase() : '';
//     const race = req.query.race ? req.query.race.toLowerCase() : '';
//     const publisher = req.query.publisher ? req.query.publisher.toLowerCase() : '';
//     const power = req.query.power ? req.query.power.toLowerCase() : '';

//     const matchingHeroIDs = [];

//     heroInfo.forEach((hero) => {
//         if (
//             (name === '' || hero.name.toLowerCase().startsWith(name)) &&
//             (race === '' || hero.Race.toLowerCase().startsWith(race)) &&
//             (publisher === '' || hero.Publisher.toLowerCase().startsWith(publisher))
//         ) {
//             matchingHeroIDs.push(hero.id);
//         }
//     });

//     if (matchingHeroIDs.length) {
//         // If power is specified, filter by power
//         if (power !== '') {
//             const filteredHeroIDs = matchingHeroIDs.filter((heroID) => {
//                 const heroName = heroInfo.find((hero) => hero.id === heroID).name;
//                 const powers = heroPower.find((power) => power.hero_names === heroName);
//                 // If power is specified, return hero IDs where the searched power matches any true power
//                 return (
//                     powers &&
//                     Object.entries(powers).some(([powerKey, powerValue]) =>
//                         powerValue === 'True' && powerKey.toLowerCase().startsWith(power.toLowerCase())
//                     )
//                 );
//             });
//             res.json({ matchingHeroIDs:filteredHeroIDs });
//         } else {
//             res.json({ matchingHeroIDs });
//         }
//     } else {
//         res.status(404).json({ message: 'No matching heroes found!' });
//     }
// });

// Updated search function for name, race, publisher, and power with soft search
app.get('/api/search', (req, res) => {
    const name = req.query.name ? req.query.name.toLowerCase().replace(/\s/g, '') : '';
    const race = req.query.race ? req.query.race.toLowerCase().replace(/\s/g, '') : '';
    const publisher = req.query.publisher ? req.query.publisher.toLowerCase().replace(/\s/g, '') : '';
    const power = req.query.power ? req.query.power.toLowerCase().replace(/\s/g, '') : '';

    const matchingHeroIDs = [];

    heroInfo.forEach((hero) => {
        if (
            (name === '' || hero.name.toLowerCase().replace(/\s/g, '').startsWith(name) || stringSimilarity.compareTwoStrings(name, hero.name.toLowerCase().replace(/\s/g, '')) > 0.6) &&
            (race === '' || hero.Race.toLowerCase().replace(/\s/g, '').startsWith(race) || stringSimilarity.compareTwoStrings(race, hero.Race.toLowerCase().replace(/\s/g, '')) > 0.6) &&
            (publisher === '' || hero.Publisher.toLowerCase().replace(/\s/g, '').startsWith(publisher) || stringSimilarity.compareTwoStrings(publisher, hero.Publisher.toLowerCase().replace(/\s/g, '')) > 0.6)
        ) {
            matchingHeroIDs.push(hero.id);
        }
    });

    if (matchingHeroIDs.length) {
        // If power is specified, filter by power
        if (power !== '') {
            const filteredHeroIDs = matchingHeroIDs.filter((heroID) => {
                const heroName = heroInfo.find((hero) => hero.id === heroID).name;
                const powers = heroPower.find((power) => power.hero_names === heroName);
                
                // If power is specified, return hero IDs where the searched power matches any true power
                return (
                    powers &&
                    Object.entries(powers).some(([powerKey, powerValue]) =>
                        powerValue.toLowerCase() === 'true' &&
                        stringSimilarity.compareTwoStrings(power, powerKey.toLowerCase().replace(/\s/g, '')) > 0.6
                    )
                );
            });
            res.json({ matchingHeroIDs: filteredHeroIDs });
        } else {
            res.json({ matchingHeroIDs });
        }
    } else {
        res.status(404).json({ message: 'No matching heroes found!' });
    }
});

// Get all list names stored for an account
app.get('/api/list_name/:accountEmail', async (req, res) => {
    const { accountEmail } = req.params;

    try {
        const account = await Model.findOne({ email: accountEmail });

        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            const listNames = Array.from(account.lists.keys());
            res.json(listNames);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get all lists regardless of account
app.get('/api/lists', async (req, res) => {
    try {
        const all_list_info = [];
        // Fetch all lists from the database
        const allLists = await Model.find({});
        for (list of allLists) {
            for (const [key, value] of list.lists) {
                console.log(value)
                all_list_info.push({
                    list_name:key,
                    email:list.email,
                    nickname:list.nickname,
                    description:value.description,
                    dateModified: value.dateModified,
                    visibilityFlag: value.visibilityFlag,
                    reviews: value.reviews,
                    Heroes: value.Heroes
                })
            }
        }
        res.json(all_list_info);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//Get all users
app.get('/api/users', async (req,res) => {
    try {
        const userInfo = [];
        const allUsers = await Model.find();
        console.log(allUsers)
        res.json(allUsers)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get hero ID based on listName
app.get('/api/list_hero_id/:accountEmail/:listName', async (req, res) => {
    const { accountEmail, listName } = req.params;

    try {
        const account = await Model.findOne({ email: accountEmail });
        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            const list = account.lists.get(listName);  // Use the get method for maps
            if (!list) {
                res.status(400).json({
                    list_name: null,
                    list_id: null,
                    message: `List "${listName}" does not exist.`
                });
            } else {
                const heroIds = Object.keys(list.Heroes || {});  // Use Object.keys to get hero IDs
                res.json({
                    list_name: listName,
                    list_id: heroIds,
                    message: null
                });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Get hero info based on listName
app.get('/api/list_hero_info/:accountEmail/:listName', async (req, res) => {
    const { accountEmail, listName } = req.params;

    try {
        const account = await Model.findOne({ email: accountEmail });
        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            const list = account.lists.get(listName);  // Use the get method for maps
            if (!list) {
                res.status(400).send(`List "${listName}" does not exist.`);
            } else {
                const heroes = list.Heroes;
                res.send(heroes);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Post to create a new list
app.post('/api/create_list', async (req, res) => {
    const { accountEmail, list } = req.body;
    const listName = list.list_name;
    let listDes = "";
    let listVisFlag = 'private';
    let heroID = [];
    if (list.description) { listDes = list.description; }
    if (list.visibilityFlag) { listVisFlag = list.visibilityFlag; }
    if (list.Heroes) {heroID = list.Heroes; }

    try {
        const account = await Model.findOne({ email: accountEmail });

        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            if (account.isDisabled) {
                res.status(401).send(`This account is disabled. Please contact your administrator!`);
            } else {
                // Check if the user has reached the limit of 20 lists
                if (account.lists.size >= 20) {
                    res.status(403).send(`You have reached the limit of 20 lists. Delete some lists to create a new one.`);
                    return;
                }

                if (!account.lists.has(listName)) {
                    // Create a new list
                    const newHeroData = {};

                    // Fetch hero details based on hero IDs
                    await Promise.all(
                        heroID.map(async (id) => {
                            const hero = heroInfo.find(h => h.id === parseInt(id));

                            if (hero) {
                                const power_object = heroPower.find(h => h.hero_names === hero.name);

                                let hero_powers;
                                if (power_object) {
                                    hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
                                } else {
                                    hero_powers = '-';
                                }

                                const heroData = {
                                    _id: id,
                                    ...hero,
                                    Power: hero_powers,
                                };

                                newHeroData[id] = heroData;
                            } else {
                                res.status(404).json({ message: `Hero ${id} was not found!` });
                                return null;
                            }
                        })
                    );

                    account.lists.set(listName, {
                        listName,
                        Heroes: newHeroData,
                        description: listDes,
                        dateModified: new Date(),
                        visibilityFlag: listVisFlag,
                        reviews:{}
                    });

                    await account.save();
                    res.send(`List ${listName} was added`);
                } else {
                    res.status(409).send(`List ${listName} conflicts (already exists)`);
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Post to update list details
app.post('/api/update_list', async (req, res) => {
    const { accountEmail, list_name, updateFields, hero_ids } = req.body;
    console.log(accountEmail, list_name, updateFields, hero_ids)

    try {
        const account = await Model.findOne({ email: accountEmail });

        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            if (account.isDisabled) {
                res.status(401).send(`This account is disabled. Please contact your administrator!`);
            } else {
                const list = account.lists.get(list_name);
                console.log('list',list)

                if (!list) {
                    res.status(400).json({ message: `List ${list_name} does not exist!` });
                } else {
                    // Update the specified fields
                    if (updateFields && updateFields.hasOwnProperty('name')) list.listName = updateFields.name;
                    if (updateFields && updateFields.hasOwnProperty('description')) list.description = updateFields.description;
                    if (updateFields && updateFields.hasOwnProperty('visibilityFlag')) list.visibilityFlag = updateFields.visibilityFlag;
                    list.dateModified = new Date();
                    console.log(list);

                    // Ensure Heroes is initialized
                    list.Heroes = list.Heroes || {};

                    // Update hero IDs if provided
                    if (hero_ids) {
                        await Promise.all(
                            hero_ids.map(async (id) => {
                                const hero = heroInfo.find(h => h.id === parseInt(id));

                                if (hero) {
                                    const power_object = heroPower.find(h => h.hero_names === hero.name);

                                    let hero_powers;
                                    if (power_object) {
                                        hero_powers = Object.keys(power_object).filter((prop) => prop !== "hero_names" && power_object[prop] === "True");
                                    } else {
                                        hero_powers = '-';
                                    }

                                    const heroData = {
                                        _id: id,
                                        ...hero,
                                        Power: hero_powers,
                                    };

                                    list.Heroes[id] = heroData;
                                } else {
                                    res.status(404).json({ message: `Hero ${id} was not found!` });
                                    return null;
                                }
                            })
                        );
                    }

                    // Save the account document with the updated list
                    await account.save();
                    res.send(`Successfully updated list ${list_name}`);
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Post to delete a list
app.post('/api/delete_list', async (req, res) => {
    const { accountEmail, list_name } = req.body;

    try {
        const account = await Model.findOne({ email: accountEmail });

        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            if (account.isDisabled) {
                res.status(401).send(`This account is disabled. Please contact your administrator!`);
            } else {
                const list = account.lists.get(list_name);
                if (!list) {
                    res.status(400).send(`List ${list_name} does not exist!`);
                } else {
                    account.lists.delete(list_name);
                    await account.save();
                    res.send(`List ${list_name} was deleted`);
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Post to create a review for a list
app.post('/api/create_review', async (req, res) => {
    const { accountEmail, list_name, rating, comment } = req.body;
    try {
        const account = await Model.findOne({ email: accountEmail });
        
        if (!account) {
            res.status(404).send(`Account ${accountEmail} not found`);
        } else {
            if (account.isDisabled) {
                res.status(401).send(`This account is disabled. Please contact your administrator!`);
            } else {
                const account_of_list = await Model.findOne({ [`lists.${list_name}`]: { $exists: true } });

                if (!account_of_list) {
                    res.status(400).send(`List ${list_name} does not exist!`);
                } else {
                    // Ensure list.reviews exists and is a Map
                    const specificList = account_of_list.lists.get(list_name);

                    if (!specificList) {
                        res.status(400).send(`List ${list_name} does not exist in the account!`);
                    } else if (!specificList.reviews) {
                        specificList.reviews = new Map();
                    }

                    // Find the last reviewID
                    let lastReviewID = 0;
                    const reviews = specificList.reviews;

                    if (reviews && reviews.size > 0) {
                        const numericKeys = Array.from(reviews.keys()).map(Number);
                        lastReviewID = Math.max(...numericKeys);
                    }

                    // Increment the last reviewID to get a new unique reviewID
                    const newReviewID = lastReviewID + 1;

                    specificList.reviews.set(String(newReviewID), {
                        userEmail: accountEmail,
                        userName: account.username,
                        reviewVisibility: true,
                        rating,
                        createdDate: new Date(),
                        comment
                    });

                    // Save the changes to the database
                    await account_of_list.save();

                    res.status(200).send(`Review added successfully with reviewID: ${newReviewID}`);
                }
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Get the average rating of a list
app.get('/api/average_rating/:list_name', async (req, res) => {
    const { list_name } = req.params;

    try {
        const account_of_list = await Model.findOne({ [`lists.${list_name}`]: { $exists: true } });

        if (!account_of_list) {
            res.status(400).json({message:`List ${list_name} does not exist!`});
        } else {
            const specificList = account_of_list.lists.get(list_name);

            if (!specificList) {
                res.status(400).json({message:`List ${list_name} does not exist in the account!`});
            } else if (!specificList.reviews || specificList.reviews.size === 0) {
                res.status(200).json({message:`List ${list_name} has no reviews yet`, averageRating:'-'});
            } else {
                // Calculate the average rating
                let totalRating = 0;
                const reviews = specificList.reviews;

                for (const [, review] of reviews) {
                    totalRating += review.rating;
                }

                const averageRating = totalRating / reviews.size;

                res.status(200).json({message:`List ${list_name} has an avg rating of ${averageRating.toFixed(2)}`,averageRating:averageRating.toFixed(2)});
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message:'Internal Server Error'});
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

// Function to generate JWT token
function generateVerificationToken(account) {
    return jwt.sign({ 
        account
    }, secretKey, { expiresIn: '1h' });
}

//Post to create account in the database
app.post('/account/create_account', async (req, res) => {
    const { email, password, username, nickname } = req.body;

    try {
        const existingAccount = await Model.findOne({ email });

        if (!existingAccount) {
            const hashed_password = await hash(password);

            const newAccount = new Model({
                email,
                username,
                password: hashed_password,
                nickname,
                isAuth: false,
                isAdmin: false,
                isDisabled: false,
                lists: {},
            });

            // Generate verification token
            const verificationToken = generateVerificationToken(newAccount);

            // Include the verification token in the response
            res.json({
                message: `Account ${email} has been created.`,
                token: verificationToken
            });

            await newAccount.save();
        } else {
            res.status(409).send(`This account ${email} already exists. Please Log In.`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/account/verify_email/:token', async (req, res) => {
    const verificationToken = req.params.token;

    try {
        const decoded = jwt.verify(verificationToken, secretKey);
        const userEmail = decoded.account.email;

        // Update the user's account to mark it as verified
        const user = await Model.findOne({ email:userEmail });
        console.log(userEmail)

        if (user) {
            user.isAuth = true;
            await user.save();

            res.json({message:`${userEmail}'s account is authenticated successfully!`});
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(401).send('Invalid or expired token');
    }
});

//Post to update password
app.post('/account/update_password', async (req, res) => {
    const { email, old_password, new_password } = req.body;

    try {
        const storedAccount = await Model.findOne({ email });

        if (!storedAccount) {
            res.status(404).send(`This account ${email} does not exist!`);
        } else {
            const is_password_valid = await verify(old_password, storedAccount.password);

            if (is_password_valid) {
                if (storedAccount.isDisabled) {
                    res.status(401).send(`This account is disabled. Please contact your administrator!`);
                } else {
                    const new_hashed_password = await hash(new_password);
                    storedAccount.password = new_hashed_password;
                    await storedAccount.save();
                    res.send(`The account ${email}'s password has been updated.`);
                }
            } else {
                res.status(401).send(`Invalid username or password.`);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Post to Log In
app.post('/account/logIn', async (req, res) => {
    const { email, password } = req.body;

    try {
        const storedAccount = await Model.findOne({ email });

        if (!storedAccount) {
            res.status(404).send(`The account ${email} does not exist! Please Create an Account.`);
        } else {
            const is_password_valid = await verify(password, storedAccount.password);

            if (is_password_valid) {
                if (storedAccount.isDisabled) {
                    res.status(401).send(`This account is disabled. Please contact your administrator!`);
                } else {
                        // Generate verification token
                        const verificationToken = generateVerificationToken(storedAccount);

                        // Include the verification token in the response
                        res.json({
                            message: `You are logged in to ${email}.`,
                            token: verificationToken
                        });
                }
            } else {
                res.status(401).send(`Invalid username or password.`);
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Post to create admin
app.post('/admin/create_admin', async (req, res) => {
    const { email, password, username, nickname } = req.body;

    try {
        const existingAdmin = await Model.findOne({ email });

        if (!existingAdmin) {
            const hashed_password = await hash(password);

            const newAdmin = new Model({
                email,
                username,
                password: hashed_password,
                nickname,
                isAuth: true,
                isAdmin: true,
                isDisabled: false,
                lists: {},
            });

            await newAdmin.save();
            res.send(`The admin account ${email} has been created.`);
        } else {
            res.status(409).send(`This account ${email} already exists. Please Log In.`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Post to switch admin permissions
app.post('/admin/admin_perm', async (req, res) => {
    const { email, adminEmail } = req.body;

    try {
        const stored_account = await Model.findOne({ email });
        const admin_account = await Model.findOne( { email: adminEmail });
        if (admin_account.isAdmin) {
            if (!stored_account) {
                res.status(404).send(`This account ${email} does not exist!`);
            } else {
                stored_account.isAdmin = !stored_account.isAdmin;
                await stored_account.save();
                if (stored_account.isAdmin) {res.send(`The account ${email} is now an admin`);}
                else {res.send(`The account ${email} is now not an admin`);}
            }
        } else {
            res.status(401).send(`The account for ${adminEmail} does not have permission!`);
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send(`Internal Server Error`);
    }
});

//Post to mark a user as disabled/enabled
app.post('/admin/disable_user', async (req, res) => {
    const { email, adminEmail } = req.body;

    try {
        const storedAccount = await Model.findOne({ email });
        const admin_account = await Model.findOne( { email: adminEmail });

        if (admin_account.isAdmin) {
            if (!storedAccount) {
                res.status(404).send(`This account ${email} does not exist!`);
            } else {
                storedAccount.isDisabled = !storedAccount.isDisabled;
                await storedAccount.save();
                if (storedAccount.isDisabled) {res.send(`The account ${email} is now disabled`);}
                else {res.send(`The account ${email} is now enabled`);}
            }
        } else {
            res.status(401).send(`The account for ${adminEmail} does not have permission!`);
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Post to mark review as hidden
app.post('/admin/hide_review', async (req, res) => {
    const { email, list_name, reviewID, adminEmail } = req.body;

    try {
        const storedAccount = await Model.findOne({ email });
        const admin_account = await Model.findOne({ email: adminEmail });

        if (admin_account.isAdmin) {
            if (!storedAccount) {
                res.status(404).send(`This account ${email} does not exist!`);
            } else {
                const specificList = storedAccount.lists.get(list_name);

                if (!specificList) {
                    res.status(404).send(`List ${list_name} not found for account ${email}`);
                } else {
                    const review = specificList.reviews && specificList.reviews.get(reviewID);

                    if (!review) {
                        res.status(404).send(`Review with ID ${reviewID} not found for account ${email}`);
                    } else {
                        // Toggle reviewVisibility
                        review.reviewVisibility = !review.reviewVisibility;
                        await storedAccount.save();

                        if (review.reviewVisibility) {
                            res.send(`Review with ID ${reviewID} for account ${email} is now visible`);
                        } else {
                            res.send(`Review with ID ${reviewID} for account ${email} is now hidden`);
                        }
                    }
                }
            }
        } else {
            res.status(401).send(`The account for ${adminEmail} does not have permission!`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

//Listen for requests on port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});