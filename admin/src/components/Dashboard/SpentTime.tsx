import React, { useState, useEffect } from 'react';
import ReactApexChart from 'react-apexcharts';
import api from '../../services/api';

const UserSpentTime = () => {
  const [series, setSeries] = useState([]);
  
  const [options, setOptions] = useState<any>({
    chart: {
        id: 'area-datetime',
        type: 'area',
        height: 350,
        zoom: {
          autoScaleYaxis: true
        }
      },
      annotations: {
        yaxis: [{
          y: 30,
          borderColor: '#999',
          label: {
            show: true,
            text: 'Support',
            style: {
              color: "#fff",
              background: '#00E396'
            }
          }
        }],
        xaxis: [{
          x: new Date('14 Nov 2012').getTime(),
          borderColor: '#999',
          yAxisIndex: 0,
          label: {
            show: true,
            text: 'Rally',
            style: {
              color: "#fff",
              background: '#775DD0'
            }
          }
        }]
      },
      dataLabels: {
        enabled: false
      },
      markers: {
        size: 0,
        style: 'hollow',
      },
      xaxis: {
        type: 'datetime',
        tickAmount: 6,
        labels: {
          formatter: function (val) {
            return new Date(val).toLocaleDateString(); // Format x-axis labels as dates
          }
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return val.toFixed(2) + ' minutes'; // Format y-axis labels with two decimal points and append "minutes" suffix
          }
        }
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy'
        }
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 100]
        }
      },
      selection: 'one_year',
    // More options...
  });

  const [selection, setSelection] = useState('one_year');

  const updateData = (timeline) => {
    setSelection(timeline);
    
    switch (timeline) {
      case 'one_month':
        // Update data for one month...
        break;
      case 'six_months':
        // Update data for six months...
        break;
      // More cases...
      default:
    }
  }

  useEffect(() => {
    // Fetch data from the backend API
    const fetchData = async () => {
      try {
        const response = await api.get('kpi/get-user-spent-time?interval=perYear');
        const data = await response.data;
        // Extract dates and durations from the received data
        const updatedSeries = [{
          name: 'Time Spent',
          data: data.map(item => [new Date(item.date).getTime(), item.totalDurationInMinutes])
        }];
        setSeries(updatedSeries);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [selection]); // Dependency array ensures useEffect runs only when selection changes

  return (
    <div>
      <div>
        <div className="toolbar">
          <button id="one_month" onClick={() => updateData('one_month')} className={selection === 'one_month' ? 'active' : ''}>
            1M
          </button>
          <button id="six_months" onClick={() => updateData('six_months')} className={selection === 'six_months' ? 'active' : ''}>
            6M
          </button>
          <button id="one_year" onClick={() => updateData('one_year')} className={selection === 'one_year' ? 'active' : ''}>
            1Y
          </button>
          <button id="ytd" onClick={() => updateData('ytd')} className={selection === 'ytd' ? 'active' : ''}>
            YTD
          </button>
          <button id="all" onClick={() => updateData('all')} className={selection === 'all' ? 'active' : ''}>
            ALL
          </button>
        </div>
        <div>
          <ReactApexChart options={options} series={series} type="area" height={350} />
        </div>
      </div>
    </div>
  );
}

export default UserSpentTime;
