import logo from './logo.svg';
import './App.css';

import React, { useState } from 'react';
import Papa from 'papaparse';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Alert,
  IconButton,
  Snackbar
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import theme from './theme';

import './App.css';

function App() {
  // Download CSV template handler
  const handleDownloadTemplate = () => {
    const csvHeader = 'SKU,term_months,startDate,endDate,listPrice,discount,quantity\n';
    const sample1 = 'Q9Y58AAE,12,2025-05-01,2026-05-01,1000,10,5\n';
    const sample2 = 'J8X23B1,24,2024-10-15,2026-10-15,2500,15,10\n';
    const csvContent = csvHeader + sample1 + sample2;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'subscriptions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [subscriptions, setSubscriptions] = useState([
    { sku: '', term: '', startDate: '', endDate: '', listPrice: '', discount: '', quantity: '' }
  ]);
  const [result, setResult] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]); // [{row: idx, field: 'sku'}]


  const handleChange = (index, field, value) => {
    const newSubs = subscriptions.map((sub, i) =>
      i === index ? { ...sub, [field]: value } : sub
    );
    setSubscriptions(newSubs);
    // Remove error for this field if present
    setFieldErrors(errors => errors.filter(e => !(e.row === index && e.field === field)));
  };


  const addSubscription = () => {
    setSubscriptions([
      ...subscriptions,
      { sku: '', term: '', startDate: '', endDate: '', listPrice: '', discount: '', quantity: '' }
    ]);
  };

  const removeSubscription = (index) => {
    setSubscriptions(subscriptions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate fields
    const requiredFields = ['sku', 'term', 'startDate', 'endDate', 'listPrice', 'discount', 'quantity'];
    let errors = [];
    let endDateWarnings = [];
    const today = new Date();
    today.setHours(0,0,0,0); // ignore time part
    subscriptions.forEach((sub, idx) => {
      requiredFields.forEach(field => {
        if (!sub[field] || (['listPrice','term','quantity'].includes(field) && isNaN(Number(sub[field])))) {
          errors.push({ row: idx, field });
        }
      });
      if (sub.endDate) {
        const end = new Date(sub.endDate);
        if (!isNaN(end) && end < today) {
          errors.push({ row: idx, field: 'endDate' });
          endDateWarnings.push({ row: idx + 1, sku: sub.sku, endDate: sub.endDate });
        }
      }
    });
    setFieldErrors(errors);
    if (endDateWarnings.length > 0) {
      setResult(
        <div>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Some subscriptions have an end date prior to today:<br/>
            {endDateWarnings.map(w => (
              <div key={w.row}>Row {w.row} (SKU: {w.sku || 'N/A'}) – End Date: {w.endDate}</div>
            ))}
            <div>These licenses cannot be processed. Please correct these rows to proceed.</div>
          </Alert>
        </div>
      );
      return;
    }
    if (errors.length > 0) {
      setResult('Please fix errors highlighted in red.');
      return;
    }
    // Weighted average co-term logic
    let weightedSum = 0;
    let totalNet = 0;
    let valid = false;

    subscriptions.forEach(sub => {
      const { endDate, listPrice, discount, quantity } = sub;
      if (!endDate || !listPrice || !quantity) return;
      const net = parseFloat(listPrice) * (1 - parseFloat(discount || 0) / 100) * parseInt(quantity);
      const endTimestamp = new Date(endDate).getTime();
      if (isNaN(net) || isNaN(endTimestamp)) return;
      weightedSum += net * endTimestamp;
      totalNet += net;
      valid = true;
    });

    if (!valid || totalNet === 0) {
      setResult('Please enter valid subscription details.');
      return;
    }

    const weightedEndTimestamp = weightedSum / totalNet;
    const weightedEndDate = new Date(weightedEndTimestamp);
    const formatted = weightedEndDate.toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    // Calculate days left for each license
    const daysLeftList = subscriptions.map((sub, i) => {
      if (!sub.endDate) return null;
      const end = new Date(sub.endDate);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return {
        sku: sub.sku,
        endDate: sub.endDate,
        daysLeft: diff
      };
    }).filter(Boolean);

    // Build result JSX
    setResult(
      <div>
        <div style={{ fontWeight: 600, marginBottom: 12 }}>All subscriptions will co-terminate on: <span style={{ color: '#00b388' }}>{formatted}</span></div>
        <div style={{ fontWeight: 500, marginBottom: 6 }}>Days left on each license:</div>
        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', border: '1px solid #e6e8ea' }}>
          <thead>
            <tr style={{ background: '#f4f8f7' }}>
              <th style={{ border: '1px solid #e6e8ea', padding: '6px 10px', color: '#00b388', fontWeight: 600 }}>SKU</th>
              <th style={{ border: '1px solid #e6e8ea', padding: '6px 10px', color: '#00b388', fontWeight: 600 }}>End Date</th>
              <th style={{ border: '1px solid #e6e8ea', padding: '6px 10px', color: '#00b388', fontWeight: 600 }}>Days Left</th>
            </tr>
          </thead>
          <tbody>
            {daysLeftList.map((item, idx) => (
              <tr key={idx}>
                <td style={{ border: '1px solid #e6e8ea', padding: '6px 10px' }}>{item.sku}</td>
                <td style={{ border: '1px solid #e6e8ea', padding: '6px 10px' }}>{new Date(item.endDate).toLocaleDateString()}</td>
                <td style={{ border: '1px solid #e6e8ea', padding: '6px 10px' }}>{item.daysLeft}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  // CSV upload handler
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map CSV columns to expected fields (case-insensitive)
        const mapField = (row, field) => {
          const keys = Object.keys(row);
          const found = keys.find(k => k.trim().toLowerCase() === field.toLowerCase());
          return found ? row[found] : '';
        };
        const csvSubs = results.data.map(row => ({
          sku: mapField(row, 'SKU'),
          term: mapField(row, 'term_months'),
          startDate: mapField(row, 'startDate'),
          endDate: mapField(row, 'endDate'),
          listPrice: mapField(row, 'listPrice'),
          discount: mapField(row, 'discount'),
          quantity: mapField(row, 'quantity'),
        })).filter(row => row.sku && row.endDate && row.listPrice && row.quantity);
        if (csvSubs.length === 0) {
          alert('No valid rows found in CSV.');
        } else {
          setSubscriptions(csvSubs);
        }
      },
      error: (err) => {
        alert('Error parsing CSV: ' + err.message);
      }
    });
  };

  // Export to CSV
  const handleExport = () => {
    // Calculate weighted average co-term date (same as in handleSubmit)
    let weightedSum = 0;
    let totalNet = 0;
    subscriptions.forEach(sub => {
      const { endDate, listPrice, discount, quantity } = sub;
      if (!endDate || !listPrice || !quantity) return;
      const net = parseFloat(listPrice) * (1 - parseFloat(discount || 0) / 100) * parseInt(quantity);
      const endTimestamp = new Date(endDate).getTime();
      if (isNaN(net) || isNaN(endTimestamp)) return;
      weightedSum += net * endTimestamp;
      totalNet += net;
    });
    let coTermedDate = '';
    if (totalNet > 0) {
      const weightedEndTimestamp = weightedSum / totalNet;
      const dateObj = new Date(weightedEndTimestamp);
      coTermedDate = dateObj.toISOString().slice(0, 10); // yyyy-mm-dd
    }
    // Calculate days left for each license and add coTermedDate
    const today = new Date();
    const daysLeftList = subscriptions.map((sub, i) => {
      if (!sub.endDate) return null;
      const end = new Date(sub.endDate);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return {
        ...sub,
        daysLeft: diff,
        coTermedDate
      };
    }).filter(Boolean);
    const csv = Papa.unparse(daysLeftList);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'subscriptions_coterm.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
        <AppBar position="static" color="primary" elevation={2} sx={{ mb: 4 }}>
          <Toolbar>
            <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
              Subscription Co-Terminator
            </Typography>
          </Toolbar>
        </AppBar>
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 4 }, width: '100%' }}>
        <Card elevation={3} sx={{ mb: 3, width: '100%' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between">
              <Grid item xs={12} md={7}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }} gutterBottom>
                  Upload CSV
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  component="label"
                  sx={{ mr: 2, mb: { xs: 2, md: 0 } }}
                >
                  Choose File
                  <input type="file" accept=".csv" hidden onChange={handleCSVUpload} />
                </Button>
                <Button
                  variant="text"
                  startIcon={<DownloadIcon />}
                  sx={{ mr: 2, mb: { xs: 2, md: 0 } }}
                  onClick={handleDownloadTemplate}
                  color="secondary"
                >
                  Download CSV Template
                </Button>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Columns: SKU, term, startDate, endDate, listPrice, discount, quantity (header names not case sensitive)
                </Typography>
              </Grid>
              <Grid item xs={12} md={5} textAlign={{ xs: 'left', md: 'right' }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                  sx={{ mb: { xs: 2, md: 0 } }}
                  color="primary"
                >
                  Export to CSV
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card elevation={3} sx={{ mb: 3, width: '100%' }}>
          <CardContent>
            <Box component="form" onSubmit={handleSubmit} autoComplete="off">
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 0, width: '100%' }}>
                <Table size="small" sx={{ width: '100%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell>Term (months)</TableCell>
                      <TableCell>Start Date</TableCell>
                      <TableCell>End Date</TableCell>
                      <TableCell>List Price</TableCell>
                      <TableCell>Discount (%)</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell align="center"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
  {subscriptions.map((sub, idx) => (
    <TableRow key={idx}>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          value={sub.sku}
          onChange={e => handleChange(idx, 'sku', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'sku')}
          label="SKU"
          inputProps={{ maxLength: 20, minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 1, maxLength: 20, minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          value={sub.term}
          onChange={e => handleChange(idx, 'term', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'term')}
          label="Term"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          type="date"
          value={sub.startDate}
          onChange={e => handleChange(idx, 'startDate', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'startDate')}
          label="Start Date"
          inputProps={{ minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          type="date"
          value={sub.endDate}
          onChange={e => handleChange(idx, 'endDate', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'endDate')}
          label="End Date"
          inputProps={{ minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 0, step: 0.01, maxLength: 20, minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          value={sub.listPrice}
          onChange={e => handleChange(idx, 'listPrice', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'listPrice')}
          label="List Price"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 0, max: 100, step: 0.01, maxLength: 20, minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          value={sub.discount}
          onChange={e => handleChange(idx, 'discount', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'discount')}
          label="Discount (%)"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell sx={{ width: '12.5%', px: 1 }}>
        <TextField
          variant="outlined"
          size="small"
          type="number"
          inputProps={{ min: 1, maxLength: 20, minWidth: 100, maxWidth: 180, style: { width: '100%' } }}
          value={sub.quantity}
          onChange={e => handleChange(idx, 'quantity', e.target.value)}
          required
          error={fieldErrors.some(e => e.row === idx && e.field === 'quantity')}
          label="Quantity"
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
      </TableCell>
      <TableCell align="center">
        {subscriptions.length > 1 && (
          <IconButton color="error" onClick={() => removeSubscription(idx)} aria-label="Remove row">
            <DeleteIcon />
          </IconButton>
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
</Table>
</TableContainer>
<Grid container spacing={2} sx={{ mt: 2 }}>
  <Grid item xs={12} sm={6}>
    <Button variant="outlined" color="primary" onClick={addSubscription} fullWidth>
      Add Subscription
    </Button>
  </Grid>
  <Grid item xs={12} sm={6}>
    <Button variant="contained" color="success" type="submit" fullWidth>
      Calculate Co-Term End Date
    </Button>
  </Grid>
</Grid>
</Box>
{result && (
  <Box sx={{ mt: 3 }}>
    <Card elevation={2} sx={{ bgcolor: '#f4f8f7' }}>
      <CardContent>
        {typeof result === 'string' ? (
          <Alert severity="error">{result}</Alert>
        ) : (
          result
        )}
      </CardContent>
    </Card>
  </Box>
)}
</CardContent>
</Card>
</Container>
</Box>
      </ThemeProvider>
  );
}


export default App;
