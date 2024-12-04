import React, { useState, useEffect } from 'react';
import InteractionHistory from './InteractionHistory';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Container,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DeleteIcon from '@mui/icons-material/Delete';

const printStyles = `
    @media print {
        @page {
            margin: 20mm;
        }
        .no-print {
            display: none;
        }
        .print-only {
            display: block;
        }
        .interaction-report {
            page-break-inside: avoid;
            margin-bottom: 20px;
        }
        .print-header {
            border-bottom: 2px solid #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
        }
        .print-footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
        }
    }
`;



function DrugInteractionForm() {
    const [drugs, setDrugs] = useState([]);
    const [selectedDrugs, setSelectedDrugs] = useState([]);
    const [interactionResults, setInteractionResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [checkHistory, setCheckHistory] = useState([]);
    const [severityFilter, setSeverityFilter] = useState('all');

    const handleDosageChange = (drugId, value) => {
        setSelectedDrugs(selectedDrugs.map(drug => 
            drug.drug_id === drugId ? { ...drug, dosage: value } : drug
        ));
    };

    const handleDurationChange = (drugId, value) => {
        setSelectedDrugs(selectedDrugs.map(drug => 
            drug.drug_id === drugId ? { ...drug, duration: value } : drug
        ));
    };
    const handlePrintResults = () => {
        window.print();
    };
    const handleSeverityFilterChange = (event) => {
        setSeverityFilter(event.target.value);
    };
    const filteredResults = severityFilter === 'all' 
    ? interactionResults 
    : interactionResults.filter(result => result.severity === severityFilter);


    useEffect(() => {
        fetch('http://localhost:3001/api/drugs')
            .then(response => response.json())
            .then(data => {
                console.log('Loaded drugs:', data);
                setDrugs(data);
            })
            .catch(error => console.error('Error loading drugs:', error));
    }, []);

    const handleDrugSelect = (event) => {
        const selectedDrug = drugs.find(drug => drug.drug_id === event.target.value);
        if (selectedDrug && !selectedDrugs.find(drug => drug.drug_id === selectedDrug.drug_id)) {
            setSelectedDrugs([...selectedDrugs, selectedDrug]);
        }
    };

    const handleRemoveDrug = (drugId) => {
        setSelectedDrugs(selectedDrugs.filter(drug => drug.drug_id !== drugId));
    };

    const handleCheckInteractions = () => {
        setLoading(true);
        const drugIds = selectedDrugs.map(drug => drug.drug_id);
        const timestamp = new Date();
    
        fetch('http://localhost:3001/api/check-interactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ drugIds }),
        })
            .then(response => response.json())
            .then(data => {
                setInteractionResults(data);
                setCheckHistory([...checkHistory, {
                    timestamp,
                    drugs: selectedDrugs.map(drug => drug.drug_name),
                    hasInteraction: data.length > 0,
                    severity: data.length > 0 ? data[0].severity : null
                }]);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error checking interactions:', error);
                setLoading(false);
            });
    };
    
    return (
        <>
            <style>{printStyles}</style>
            <Container maxWidth="lg">
                <Box sx={{ mt: 4, mb: 4 }}>
                    <Typography variant="h4" gutterBottom className="no-print">
                        Drug Interaction Checker
                    </Typography>
    
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8} className="no-print">
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Select Medications
                                </Typography>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel>Select Drug</InputLabel>
                                    <Select
                                        value=""
                                        onChange={handleDrugSelect}
                                        label="Select Drug"
                                    >
                                        {drugs.map((drug) => (
                                            <MenuItem key={drug.drug_id} value={drug.drug_id}>
                                                {drug.drug_name} ({drug.brand_name})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
    
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Drug Name</TableCell>
                                                <TableCell>Dosage</TableCell>
                                                <TableCell>Duration</TableCell>
                                                <TableCell>Action</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {selectedDrugs.map((drug) => (
                                                <TableRow key={drug.drug_id}>
                                                    <TableCell>{drug.drug_name}</TableCell>
                                                    <TableCell>
                                                        <TextField 
                                                            size="small" 
                                                            label="Dosage" 
                                                            onChange={(e) => handleDosageChange(drug.drug_id, e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <TextField 
                                                            size="small" 
                                                            label="Duration" 
                                                            onChange={(e) => handleDurationChange(drug.drug_id, e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            onClick={() => handleRemoveDrug(drug.drug_id)}
                                                            color="error"
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
    
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleCheckInteractions}
                                        disabled={selectedDrugs.length < 2 || loading}
                                    >
                                        {loading ? 'Checking...' : 'Check Interactions'}
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
    
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }} className="no-print">
                                    <Typography variant="h6">
                                        Interaction Results
                                    </Typography>
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Severity Filter</InputLabel>
                                        <Select
                                            value={severityFilter}
                                            onChange={handleSeverityFilterChange}
                                            label="Severity Filter"
                                        >
                                            <MenuItem value="all">All</MenuItem>
                                            <MenuItem value="High">High</MenuItem>
                                            <MenuItem value="Moderate">Moderate</MenuItem>
                                            <MenuItem value="Low">Low</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    onClick={handlePrintResults}
                                    startIcon={<PrintIcon />}
                                    disabled={!interactionResults.length}
                                    className="no-print"
                                >
                                    Print Results
                                </Button>
                                {selectedDrugs.length >= 2 ? (
                                    filteredResults.length > 0 ? (
                                        <>
                                            <Box className="print-only">
                                                <Typography variant="h5" gutterBottom>
                                                    Drug Interaction Report
                                                </Typography>
                                                <Typography variant="subtitle2" gutterBottom>
                                                    Generated: {new Date().toLocaleString()}
                                                </Typography>
                                            </Box>
                                            {filteredResults.map((result, index) => (
                                                <Paper
                                                    className="interaction-report"
                                                    key={index}
                                                    sx={{
                                                        p: 2,
                                                        mb: 2,
                                                        bgcolor: result.severity === 'High' ? '#ffebee' :
                                                            result.severity === 'Moderate' ? '#fff3e0' : '#f1f8e9'
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" color="error">
                                                        {result.drug1_name} + {result.drug2_name}
                                                    </Typography>
                                                    <Typography variant="subtitle2" sx={{ mt: 1 }}>
                                                        Severity: {result.severity}
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ mt: 1 }}>
                                                        {result.interaction_description}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                            <Box className="print-footer print-only">
                                                <Typography variant="body2">
                                                    Report generated by Drug Interaction Checker
                                                    <br />
                                                    Date: {new Date().toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </>
                                    ) : (
                                        <Paper sx={{ p: 2, bgcolor: '#e8f5e9' }}>
                                            <Typography variant="subtitle1" color="success.main">
                                                Safe Combination
                                            </Typography>
                                            <Typography variant="body1">
                                                No known interactions found between these medications. They are generally safe to take together.
                                            </Typography>
                                        </Paper>
                                    )
                                ) : (
                                    <Typography>
                                        Select at least two medications to check for interactions
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                        <Grid item xs={12} className="no-print">
                            <InteractionHistory history={checkHistory} />
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </>
    ); 
}
export default DrugInteractionForm;