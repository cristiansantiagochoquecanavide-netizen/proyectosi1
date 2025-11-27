import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import SearchIcon from '@mui/icons-material/Search';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ReportFinanciero from './Financiero';
import ReportClinico from './Clinico';
import ReportBitacora from './Bitacora';
import ReportBusqueda from './Busqueda';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function Reportes() {
  const [tabActivo, setTabActivo] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Sistema de Reportes
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Gestiona y visualiza reportes financieros, clínicos y bitácora de acciones del sistema
        </Typography>
      </Box>

      {/* Tarjetas de resumen */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FileDownloadIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Reportes
                  </Typography>
                  <Typography variant="h6">Financieros</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'success.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Reportes
                  </Typography>
                  <Typography variant="h6">Clínicos</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <HistoryIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Bitácora de
                  </Typography>
                  <Typography variant="h6">Acciones</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SearchIcon sx={{ fontSize: 40, color: 'info.main' }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Búsqueda
                  </Typography>
                  <Typography variant="h6">Avanzada</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs con reportes */}
      <Paper>
        <Tabs
          value={tabActivo}
          onChange={(e, newValue) => setTabActivo(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          <Tab 
            label="Reportes Financieros" 
            icon={<FileDownloadIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Reportes Clínicos" 
            icon={<AssessmentIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Bitácora de Acciones" 
            icon={<HistoryIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Búsqueda Avanzada" 
            icon={<SearchIcon />}
            iconPosition="start"
          />
        </Tabs>

        {/* Contenido de tabs */}
        <TabPanel value={tabActivo} index={0}>
          <ReportFinanciero />
        </TabPanel>

        <TabPanel value={tabActivo} index={1}>
          <ReportClinico />
        </TabPanel>

        <TabPanel value={tabActivo} index={2}>
          <ReportBitacora />
        </TabPanel>

        <TabPanel value={tabActivo} index={3}>
          <ReportBusqueda />
        </TabPanel>
      </Paper>
    </Container>
  );
}
