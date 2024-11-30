"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const PerformanceDashboard = () => {
  interface Metric {
    timestamp: string;
    messageCount: number;
    throughput: number;
    latency: number;
    cpuUsage: number;
  }
  
  interface MetricsState {
    kafka: { data: Metric[]; current: Partial<Metric> };
    rabbitmq: { data: Metric[]; current: Partial<Metric> };
  }
  
  const [metrics, setMetrics] = useState<MetricsState>({
    kafka: { data: [], current: {} },
    rabbitmq: { data: [], current: {} }
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/metrics');
        const newMetrics = await response.json();
        
        setMetrics(prevMetrics => ({
          kafka: {
            data: [...prevMetrics.kafka.data, newMetrics.kafka],
            current: newMetrics.kafka
          },
          rabbitmq: {
            data: [...prevMetrics.rabbitmq.data, newMetrics.rabbitmq],
            current: newMetrics.rabbitmq
          }
        }));
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      }
    };

    const interval = setInterval(fetchMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  interface MetricCardProps {
    title: string;
    kafka: number;
    rabbitmq: number;
    unit?: string;
  }

  const MetricCard = ({ title, kafka, rabbitmq, unit = '' }: MetricCardProps) => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{kafka}{unit}</div>
            <div className="text-sm text-gray-500">Kafka</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{rabbitmq}{unit}</div>
            <div className="text-sm text-gray-500">RabbitMQ</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Messaging Performance Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Messages Processed"
          kafka={metrics.kafka.current.messageCount || 0}
          rabbitmq={metrics.rabbitmq.current.messageCount || 0}
        />
        <MetricCard 
          title="Throughput"
          kafka={Math.round(metrics.kafka.current.throughput || 0)}
          rabbitmq={Math.round(metrics.rabbitmq.current.throughput || 0)}
          unit=" msg/s"
        />
        <MetricCard 
          title="Latency"
          kafka={Number(metrics.kafka.current.latency?.toFixed(2))|| 0} 
          rabbitmq={Number(metrics.rabbitmq.current.latency?.toFixed(2)) || 0}
          unit=" ms"
        />
        <MetricCard 
          title="CPU Usage"
          kafka={Number(metrics.kafka.current.cpuUsage?.toFixed(1)) || 0}
          rabbitmq={Number(metrics.rabbitmq.current.cpuUsage?.toFixed(1)) || 0}
          unit="%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Throughput Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  data={metrics.kafka.data} 
                  stroke="#8884d8" 
                  name="Kafka" 
                />
                <Line 
                  type="monotone" 
                  dataKey="throughput" 
                  data={metrics.rabbitmq.data} 
                  stroke="#82ca9d" 
                  name="RabbitMQ" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latency Over Time</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  data={metrics.kafka.data} 
                  stroke="#8884d8" 
                  name="Kafka" 
                />
                <Line 
                  type="monotone" 
                  dataKey="latency" 
                  data={metrics.rabbitmq.data} 
                  stroke="#82ca9d" 
                  name="RabbitMQ" 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceDashboard;