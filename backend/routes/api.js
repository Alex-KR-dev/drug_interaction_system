const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// GET all drugs
router.get('/drugs', (req, res) => {
    connection.query('SELECT * FROM drugs', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// GET all interactions
router.get('/interactions', (req, res) => {
    connection.query('SELECT * FROM interactions', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// GET all prescriptions
router.get('/prescriptions', (req, res) => {
    connection.query('SELECT * FROM prescriptions', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

router.post('/check-interactions', (req, res) => {
    const { drugIds } = req.body;
    console.log('Checking interactions for drugs:', drugIds);
    
    const query = `
        SELECT i.*, i.description, i.interaction_effect, d1.drug_name as drug1_name, d2.drug_name as drug2_name
        FROM interactions i
        JOIN drugs d1 ON i.drug_a_id = d1.drug_id
        JOIN drugs d2 ON i.drug_b_id = d2.drug_id
        WHERE (i.drug_a_id IN (?) AND i.drug_b_id IN (?))
        OR (i.drug_b_id IN (?) AND i.drug_a_id IN (?))
    `;
    
    connection.query(query, [drugIds, drugIds, drugIds, drugIds], (err, results) => {
        console.log('Query results:', results);
        res.json(results);
    });
});


module.exports = router;
