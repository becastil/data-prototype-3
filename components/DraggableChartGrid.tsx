'use client';

import { useState, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import { Box, Paper, IconButton, Typography, Menu, MenuItem, Button, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

export interface ChartConfig {
  id: string;
  type: 'bar' | 'pie' | 'line' | 'table' | 'kpi';
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  content: React.ReactNode;
}

interface DraggableChartGridProps {
  initialCharts?: ChartConfig[];
  availableCharts?: Array<{
    type: ChartConfig['type'];
    title: string;
    content: React.ReactNode;
  }>;
  onLayoutChange?: (charts: ChartConfig[]) => void;
}

export function DraggableChartGrid({
  initialCharts = [],
  availableCharts = [],
  onLayoutChange
}: DraggableChartGridProps) {
  const [charts, setCharts] = useState<ChartConfig[]>(initialCharts);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleAddMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAddMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddChart = useCallback((chartTemplate: typeof availableCharts[0]) => {
    const newChart: ChartConfig = {
      id: `chart-${Date.now()}`,
      type: chartTemplate.type,
      title: chartTemplate.title,
      x: (charts.length * 2) % 12,
      y: Infinity, // Puts it at the bottom
      w: 6,
      h: 4,
      content: chartTemplate.content
    };

    const updatedCharts = [...charts, newChart];
    setCharts(updatedCharts);
    onLayoutChange?.(updatedCharts);
    handleAddMenuClose();
  }, [charts, onLayoutChange]);

  const handleRemoveChart = useCallback((chartId: string) => {
    const updatedCharts = charts.filter(chart => chart.id !== chartId);
    setCharts(updatedCharts);
    onLayoutChange?.(updatedCharts);
  }, [charts, onLayoutChange]);

  const handleLayoutChange = useCallback((layout: GridLayout.Layout[]) => {
    const updatedCharts = charts.map(chart => {
      const layoutItem = layout.find(l => l.i === chart.id);
      if (layoutItem) {
        return {
          ...chart,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        };
      }
      return chart;
    });
    setCharts(updatedCharts);
    onLayoutChange?.(updatedCharts);
  }, [charts, onLayoutChange]);

  const getChartIcon = (type: ChartConfig['type']) => {
    switch (type) {
      case 'bar': return <BarChartIcon />;
      case 'pie': return <PieChartIcon />;
      case 'line': return <ShowChartIcon />;
      case 'table': return <TableChartIcon />;
      default: return <BarChartIcon />;
    }
  };

  const layout = charts.map(chart => ({
    i: chart.id,
    x: chart.x,
    y: chart.y,
    w: chart.w,
    h: chart.h,
    minW: 3,
    minH: 3
  }));

  return (
    <Box>
      {/* Add Chart Button */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end', gap: 1, alignItems: 'center' }}>
        <Chip
          label={`${charts.length} chart${charts.length !== 1 ? 's' : ''}`}
          color="primary"
          variant="outlined"
          size="small"
        />
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddMenuOpen}
          size="small"
        >
          Add Chart
        </Button>
      </Box>

      {/* Chart Selection Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAddMenuClose}
      >
        {availableCharts.map((chart, index) => (
          <MenuItem key={index} onClick={() => handleAddChart(chart)}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getChartIcon(chart.type)}
              <Typography>{chart.title}</Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>

      {/* Draggable Grid */}
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1200}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".drag-handle"
        isDraggable={true}
        isResizable={true}
      >
        {charts.map(chart => (
          <div key={chart.id}>
            <Paper
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid #e0e0e0',
                '&:hover .chart-controls': {
                  opacity: 1
                }
              }}
            >
              {/* Chart Header with Drag Handle and Close Button */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 1,
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#fafafa',
                  cursor: 'move'
                }}
                className="drag-handle"
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DragIndicatorIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  {getChartIcon(chart.type)}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {chart.title}
                  </Typography>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveChart(chart.id)}
                  className="chart-controls"
                  sx={{
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      color: 'error.contrastText'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Chart Content */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {chart.content}
              </Box>
            </Paper>
          </div>
        ))}
      </GridLayout>

      {/* Empty State */}
      {charts.length === 0 && (
        <Paper
          sx={{
            p: 8,
            textAlign: 'center',
            backgroundColor: '#f5f5f5',
            border: '2px dashed #ccc'
          }}
        >
          <AddCircleOutlineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No charts added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click &quot;Add Chart&quot; to start building your dashboard
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAddMenuOpen}
          >
            Add Your First Chart
          </Button>
        </Paper>
      )}
    </Box>
  );
}
