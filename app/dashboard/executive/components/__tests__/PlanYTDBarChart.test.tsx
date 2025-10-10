import { render, screen } from '@testing-library/react';
import PlanYTDBarChart from '../PlanYTDBarChart';

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: ({ options }: { options: { plugins?: { title?: { text?: string } } } }) => (
    <div data-testid="bar-chart">
      {options?.plugins?.title?.text && <div>{options.plugins.title.text}</div>}
      Mocked Bar Chart
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
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
}));

describe('PlanYTDBarChart', () => {
  const mockData = [
    {
      month: 'Jul 24',
      hdhp: 100000,
      ppoBase: 80000,
      ppoBuyUp: 40000,
    },
    {
      month: 'Aug 24',
      hdhp: 110000,
      ppoBase: 85000,
      ppoBuyUp: 45000,
    },
  ];

  it('should render chart with data', () => {
    render(<PlanYTDBarChart data={mockData} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render with custom title', () => {
    render(<PlanYTDBarChart data={mockData} title="Custom Chart Title" />);

    expect(screen.getByText('Custom Chart Title')).toBeInTheDocument();
  });

  it('should use default title when not provided', () => {
    render(<PlanYTDBarChart data={mockData} />);

    expect(screen.getByText('Plan YTD Cost Distribution')).toBeInTheDocument();
  });

  it('should handle empty data array', () => {
    render(<PlanYTDBarChart data={[]} />);

    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('should render container with correct styling', () => {
    const { container } = render(<PlanYTDBarChart data={mockData} />);

    // Component renders a div with w-full h-full classes
    const chartContainer = container.querySelector('.w-full.h-full');
    expect(chartContainer).toBeInTheDocument();
  });
});
