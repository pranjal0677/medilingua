// client/src/components/TermNetwork.jsx
import { useEffect, useState } from 'react';
import { ResponsiveNetwork } from '@nivo/network';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { medicalService } from '../services/api';

const TermNetwork = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworkData();
  }, []);

  const loadNetworkData = async () => {
    try {
      const terms = await medicalService.getPopularTerms();
      const nodes = terms.map((term, index) => ({
        id: term.term,
        radius: 8 + (term.searchCount || 1),
        height: 8 + (term.searchCount || 1),
      }));

      const links = [];
      terms.forEach(term => {
        if (term.relatedTerms) {
          term.relatedTerms.forEach(relatedTerm => {
            if (terms.find(t => t.term === relatedTerm)) {
              links.push({
                source: term.term,
                target: relatedTerm,
                distance: 50
              });
            }
          });
        }
      });

      setData({ nodes, links });
    } catch (error) {
      console.error('Error loading network data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Paper sx={{ p: 3, height: 400 }}>
      <Typography variant="h6" gutterBottom>
        Term Relationships Network
      </Typography>
      {data && (
        <Box sx={{ height: 350 }}>
          <ResponsiveNetwork
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            linkDistance={e => e.distance}
            centeringStrength={0.3}
            repulsivity={6}
            nodeColor={node => node.color}
            nodeBorderWidth={1}
            nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
            linkThickness={1}
            linkBlendMode="multiply"
            motionStiffness={160}
            motionDamping={12}
          />
        </Box>
      )}
    </Paper>
  );
};

export default TermNetwork;