'use client'
import { useState, useEffect } from 'react'
import { DateRange } from "react-day-picker"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { Card } from '@/components/ui/card'
import axiosInstance from '@/lib/api/axiosConfig'
import { DatePickerWithRange } from '@/components/dashboard/DatePickerWithRange'
import { Table, TableBody, TableCell, TableHead, TableRow } from '@/components/ui/table'

export default function DashboardMetrics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    to: new Date()
  })

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    if (newDateRange?.from) {
      setDateRange({
        from: newDateRange.from,
        to: newDateRange.to || newDateRange.from
      })
    }
  }

  const fetchData = async () => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      setLoading(true)
      setError(null)

      const response = await axiosInstance.get('/api/dashboard', {
        params: {
          start_date: dateRange.from.toISOString(),
          end_date: dateRange.to.toISOString()
        }
      })

      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar los datos')
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [dateRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <DatePickerWithRange
          date={dateRange}
          onDateChange={handleDateChange}
        />
      </div>

      {data && (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-4">
              <h3 className="font-bold text-neutral-700 dark:text-neutral-300">Ingresos</h3>
              <p className="text-2xl font-bold text-green-600">
                ${data.summary.transactions.paid.amount.toLocaleString('es-MX')}
              </p>
              <p className="text-sm text-gray-400">
                {data.summary.transactions.paid.count} transacciones
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-neutral-700 dark:text-neutral-300">Gastos</h3>
              <p className="text-2xl font-bold text-red-600">
                ${data.summary.gastos.amount.toLocaleString('es-MX')}
              </p>
              <p className="text-sm text-gray-400">
                {data.summary.gastos.count} gastos
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-neutral-700 dark:text-neutral-300">Balance</h3>
              <p className={`text-2xl font-bold ${data.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${data.summary.balance.toLocaleString('es-MX')}
              </p>
              <p className="text-sm text-gray-400">
                Balance total
              </p>
            </Card>

            <Card className="p-4">
              <h3 className="font-bold text-neutral-700 dark:text-neutral-300">Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600">
                ${data.summary.transactions.pending.amount.toLocaleString('es-MX')}
              </p>
              <p className="text-sm text-gray-400">
                {data.summary.transactions.pending.count} pendientes
              </p>
            </Card>
          </div>

          {/* Gráficas */}
          <div className='grid lg:grid-cols-2 gap-4'>
            {/* Gráfica de Ingresos Diarios */}
            <Card className="p-4">
              <h3 className="font-bold mb-4">Ingresos Diarios</h3>
              <LineChart
                width={800}
                height={400}
                data={data.chartData.transactions.daily}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  name="Ingresos"
                />
              </LineChart>
            </Card>

            {/* Gráfica de Gastos Diarios */}
            <Card className="p-4">
              <h3 className="font-bold mb-4">Gastos Diarios</h3>
              <LineChart
                width={800}
                height={400}
                data={data.chartData.gastos.daily}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  name="Gastos"
                />
              </LineChart>
            </Card>

            {/* Gráfica de Ingresos Mensuales */}
            <Card className="p-4">
              <h3 className="font-bold mb-4">Ingresos Mensuales</h3>
              <LineChart
                width={800}
                height={400}
                data={data.chartData.transactions.monthly}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']}
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#22c55e"
                  name="Ingresos"
                />
              </LineChart>
            </Card>

            {/* Gráfica de Gastos Mensuales */}
            <Card className="p-4">
              <h3 className="font-bold mb-4">Gastos Mensuales</h3>
              <LineChart
                width={800}
                height={400}
                data={data.chartData.gastos.monthly}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })
                  }}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Monto']}
                  labelFormatter={(label) => {
                    const date = new Date(label)
                    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#ef4444"
                  name="Gastos"
                />
              </LineChart>
            </Card>
          </div>

          {/* Tabla de resumen */}
          <Card className="p-4 mt-8">
            <h3 className="font-bold mb-4">Resumen Financiero</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Concepto</TableCell>
                    <TableCell>Cantidad</TableCell>
                    <TableCell>Monto Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Ingresos
                      </span>
                    </TableCell>
                    <TableCell>{data.summary.transactions.paid.count}</TableCell>
                    <TableCell>${data.summary.transactions.paid.amount.toLocaleString('es-MX')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Gastos
                      </span>
                    </TableCell>
                    <TableCell>{data.summary.gastos.count}</TableCell>
                    <TableCell>${data.summary.gastos.amount.toLocaleString('es-MX')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Pendientes
                      </span>
                    </TableCell>
                    <TableCell>{data.summary.transactions.pending.count}</TableCell>
                    <TableCell>${data.summary.transactions.pending.amount.toLocaleString('es-MX')}</TableCell>
                  </TableRow>
                  <TableRow className="font-bold">
                    <TableCell>Balance Total</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell className={data.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${data.summary.balance.toLocaleString('es-MX')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
