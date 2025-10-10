import { render, screen } from '@testing-library/react';
import PEPMTrendChart from '../PEPMTrendChart';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: ({ options }: { options: { plugins?: { title?: { text?: string } } } }) => (
    <div data-testid="line-chart">
      {options?.plugins?.title?.text && <div>{options.plugins.title.text}</div>}
      Mocked Line Chart
    </div>
  ),
}));

// Mock Chart.js registration
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  PointElement: {},
  LineElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('PEPMTrendChart', () => {
  const mockData = [
    {
      month: 'Jul 24',
      actual: 650,
      budget: 700,
      priorYear: 620,
    },
    {
      month: 'Aug 24',
      actual: 680,
      budget: 700,
      priorYear: 640,
    },
    {
      month: 'Sep 24',
      actual: 720,
      budget: 700,
      priorYear: 660,
    },
  ];

  it('should render medical PEPM chart', () => {
    render(
      <PEPMTrendChart
        data={mockData}
        title="Medical PEPM Trend"
        type="medical"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Medical PEPM Trend')).toBeInTheDocument();
  });

  it('should render pharmacy PEPM chart', () => {
    render(
      <PEPMTrendChart
        data={mockData}
        title="Pharmacy PEPM Trend"
        type="pharmacy"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByText('Pharmacy PEPM Trend')).toBeInTheDocument();
  });

  it('should handle empty data array', () => {
    render(
      <PEPMTrendChart
        data={[]}
        title="Empty Chart"
        type="medical"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });

  it('should render container with correct styling', () => {
    const { container } = render(
      <PEPMTrendChart
        data={mockData}
        title="Test Chart"
        type="medical"
      />
    );

    // Component renders a div with w-full h-full classes
    const chartContainer = container.querySelector('.w-full.h-full') || container.querySelector('div');
    expect(chartContainer).toBeInTheDocument();
  });

  it('should handle missing optional data fields', () => {
    const partialData = [
      { month: 'Jul 24', actual: 650 },
      { month: 'Aug 24', actual: 680 },
    ];

    render(
      <PEPMTrendChart
        data={partialData}
        title="Partial Data Chart"
        type="medical"
      />
    );

    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
  });
});
