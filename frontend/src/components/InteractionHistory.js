import React from 'react';
import {
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box
} from '@mui/material';

const formatDate = (timestamp) => {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(timestamp));
};

const groupedHistory = (history) => {
    return history.reduce((groups, check) => {
        const date = new Date(check.timestamp).toLocaleDateString();
        if (!groups[date]) groups[date] = [];
        groups[date].push(check);
        return groups;
    }, {});
};

function InteractionHistory({ history }) {
    return (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Interaction Check History
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Drugs Checked</TableCell>
                            <TableCell>Result</TableCell>
                            <TableCell>Severity</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((check, index) => (
                            <TableRow key={index}>
                                <TableCell>{new Date(check.timestamp).toLocaleString()}</TableCell>
                                <TableCell>{check.drugs.join(', ')}</TableCell>
                                <TableCell>{check.hasInteraction ? 'Interaction Found' : 'Safe'}</TableCell>
                                <TableCell>{check.severity || 'N/A'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default InteractionHistory;
