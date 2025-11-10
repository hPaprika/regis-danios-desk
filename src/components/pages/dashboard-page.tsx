import React, { useMemo, useState } from "react";
import useSWR from "swr";
import {
  Luggage,
  Plane,
  AlertTriangle,
  Signature,
  Clock,
  Camera,
  Loader,
  FileX,
  Eye,
  Check,
  X,
  Info,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import supabase from "@/lib/supabase/client";
import { StatsCard } from "@/components/stats-card";
import { ChartCard } from "@/components/chart-card";
import { FilterBar } from "@/components/filter-bar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ============================================================================
// CONSTANTES Y TIPOS
// ============================================================================

const AIRLINE_COLORS: Record<string, string> = {
  LATAM: "#E31C23",
  SKY: "#003DA5",
  "JET SMART": "#FF6B00",
  AVIANCA: "#DC0829",
};

const CATEGORY_LABELS: Record<string, string> = {
  A: "Asa rota",
  B: "Maleta rota",
  C: "Rueda rota",
};

const CATEGORY_COLORS: Record<string, string> = {
  A: "bg-red-100 text-red-800 border-red-300",
  B: "bg-blue-100 text-blue-800 border-blue-300",
  C: "bg-green-100 text-green-800 border-green-300",
};

// ============================================================================
// HELPERS
// ============================================================================

const getTodayRange = () => {
  const today = new Date();
  return {
    start: new Date(today.setHours(0, 0, 0, 0)).toISOString(),
    end: new Date(today.setHours(23, 59, 59, 999)).toISOString(),
  };
};

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getLastNDays = (n: number) => {
  return Array.from({ length: n }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (n - 1 - i));
    return {
      date: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
      counter: 0,
      siberia: 0,
    };
  });
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function DashboardPage() {
  const [filters, setFilters] = useState({ dateFrom: "", dateTo: "" });
  const [tableFilters, setTableFilters] = useState({
    search: "",
    airline: "all",
    category: "all",
    shift: "all",
    source: "all",
  });
  const [activeFilter, setActiveFilter] = useState<{ type: string; value: string } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  // Fetch data
  const fetcher = async () => {
    const range = getTodayRange();
    const { data, error } = await supabase
      .from("unified_records")
      .select("*")
      .gte("fecha_hora", range.start)
      .lte("fecha_hora", range.end)
      .order("fecha_hora", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  };

  const { data = [], isLoading, error } = useSWR("dashboard-unified", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 10000,
  });

  // Filtrar por rango de fechas
  const dateFiltered = useMemo(() => {
    return data.filter((r: any) => {
      if (filters.dateFrom && new Date(r.fecha_hora) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59);
        if (new Date(r.fecha_hora) > toDate) return false;
      }
      return true;
    });
  }, [data, filters]);

  // KPIs
  const stats = useMemo(() => {
    const total = dateFiltered.length;
    const counter = dateFiltered.filter((r: any) => r.source === "counter").length;
    const siberia = dateFiltered.filter((r: any) => r.source === "siberia").length;
    const signed = dateFiltered.filter((r: any) => r.firma).length;

    const airlineCounts: Record<string, number> = {};
    dateFiltered.forEach((r: any) => {
      if (r.aerolinea) airlineCounts[r.aerolinea] = (airlineCounts[r.aerolinea] || 0) + 1;
    });
    const topAirline = Object.entries(airlineCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

    const catCounts: Record<string, number> = {};
    dateFiltered.forEach((r: any) => {
      r.categorias?.forEach((c: string) => {
        catCounts[c] = (catCounts[c] || 0) + 1;
      });
    });
    const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

    const shiftCounts: Record<string, number> = {};
    dateFiltered.forEach((r: any) => {
      if (r.turno) shiftCounts[r.turno] = (shiftCounts[r.turno] || 0) + 1;
    });
    const topShift = Object.entries(shiftCounts).sort((a, b) => b[1] - a[1])[0] || ["N/A", 0];

    return {
      total,
      counter,
      siberia,
      signed,
      signatureRate: total ? Math.round((signed / total) * 100) : 0,
      topAirline: { name: topAirline[0], count: topAirline[1] },
      topCategory: topCat ? { label: CATEGORY_LABELS[topCat[0]], count: topCat[1] } : { label: "N/A", count: 0 },
      topShift: { name: topShift[0], count: topShift[1] },
    };
  }, [dateFiltered]);

  // Datos para gráficos
  const chartData = useMemo(() => {
    const byAirline: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const trend = getLastNDays(7);

    dateFiltered.forEach((r: any) => {
      // Por aerolínea
      if (r.source === "counter" && r.aerolinea) {
        byAirline[r.aerolinea] = (byAirline[r.aerolinea] || 0) + 1;
      }

      // Por categoría
      r.categorias?.forEach((c: string) => {
        byCategory[c] = (byCategory[c] || 0) + 1;
      });

      // Tendencia
      const recordDate = new Date(r.fecha_hora).toISOString().split("T")[0];
      const day = trend.find((d) => d.date === recordDate);
      if (day) {
        if (r.source === "counter") day.counter++;
        else day.siberia++;
      }
    });

    return {
      airlines: Object.entries(byAirline).map(([name, value]) => ({ name, value })),
      categories: Object.entries(byCategory).map(([key, value]) => ({
        name: `${key} - ${CATEGORY_LABELS[key]}`,
        value,
        category: key,
      })),
      trend,
      shiftAirline: [
        { shift: "BRC-ERC", LATAM: 0, SKY: 0, "JET SMART": 0, AVIANCA: 0 },
        { shift: "IRC-KRC", LATAM: 0, SKY: 0, "JET SMART": 0, AVIANCA: 0 },
      ].map((s, idx) => {
        dateFiltered
          .filter((r: any) => r.source === "counter" && r.turno === s.shift && r.aerolinea)
          .forEach((r: any) => {
            if (s[r.aerolinea as keyof typeof s] !== undefined) {
              (s[r.aerolinea as keyof typeof s] as number)++;
            }
          });
        return s;
      }),
    };
  }, [dateFiltered]);

  // Filtros de tabla
  const tableData = useMemo(() => {
    return dateFiltered.filter((r: any) => {
      if (tableFilters.search && !r.codigo.includes(tableFilters.search)) return false;
      if (tableFilters.airline !== "all" && r.aerolinea !== tableFilters.airline) return false;
      if (tableFilters.category !== "all" && !r.categorias?.includes(tableFilters.category)) return false;
      if (tableFilters.shift !== "all" && r.turno !== tableFilters.shift) return false;
      if (tableFilters.source !== "all" && r.source !== tableFilters.source) return false;
      return true;
    });
  }, [dateFiltered, tableFilters]);

  const totalPages = Math.ceil(tableData.length / recordsPerPage);
  const paginatedData = tableData.slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage);

  // Handlers
  const handleChartClick = (type: string, value: string) => {
    setActiveFilter({ type, value });
    if (type === "airline") setTableFilters((p) => ({ ...p, airline: value }));
    if (type === "category") setTableFilters((p) => ({ ...p, category: value }));
    setTimeout(() => document.getElementById("table")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  React.useEffect(() => setCurrentPage(1), [tableFilters]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Total Daños" value={stats.total} icon={Luggage} description="Hoy" />
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aerolínea Top</p>
                <p className="text-2xl font-bold" style={{ color: AIRLINE_COLORS[stats.topAirline.name] }}>
                  {stats.topAirline.name}
                </p>
                <p className="text-xs text-muted-foreground">{stats.topAirline.count} daños</p>
              </div>
              <Plane className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Daño Frecuente</p>
                <p className="text-2xl font-bold">{stats.topCategory.label}</p>
                <p className="text-xs text-muted-foreground">{stats.topCategory.count} casos</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tasa de Firmas</p>
                <p className="text-2xl font-bold">{stats.signatureRate}%</p>
                <p className="text-xs text-muted-foreground">{stats.signed}/{stats.total}</p>
              </div>
              <Signature className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Turno Top</p>
                <p className="text-2xl font-bold">{stats.topShift.name}</p>
                <p className="text-xs text-muted-foreground">{stats.topShift.count} registros</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <StatsCard title="Casos Siberia" value={stats.siberia} icon={Camera} description="Con foto" />
      </div>

      {/* Filtros de Fecha */}
      <FilterBar onReset={() => setFilters({ dateFrom: "", dateTo: "" })} showReset={!!filters.dateFrom || !!filters.dateTo}>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Desde</Label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} className="w-40" />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="text-xs">Hasta</Label>
          <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} className="w-40" />
        </div>
      </FilterBar>

      {/* Empty State */}
      {dateFiltered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileX className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">No hay registros</h3>
          <p className="text-sm text-muted-foreground mb-4">No se encontraron datos para hoy</p>
          <Button variant="outline" onClick={() => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            setFilters({ dateFrom: sevenDaysAgo.toISOString().split("T")[0], dateTo: new Date().toISOString().split("T")[0] });
          }}>
            Ver últimos 7 días
          </Button>
        </Card>
      ) : (
        <>
          {/* Gráficos */}
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Daños por Aerolínea" description="Distribución">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.airlines}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} onClick={(d) => handleChartClick("airline", d.name)} cursor="pointer">
                    {chartData.airlines.map((e, i) => (
                      <Cell key={i} fill={AIRLINE_COLORS[e.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Daños por Categoría" description="Tipos">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categories}
                    cx="50%"
                    cy="50%"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                    onClick={(d) => handleChartClick("category", d.category)}
                    cursor="pointer"
                  >
                    {chartData.categories.map((_, i) => (
                      <Cell key={i} fill={["#ef4444", "#3b82f6", "#10b981"][i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="Tendencia 7 Días">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData.trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="counter" stroke="#2563eb" strokeWidth={2} name="Counter" />
                <Line type="monotone" dataKey="siberia" stroke="#10b981" strokeWidth={2} name="Siberia" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Daños por Turno y Aerolínea">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.shiftAirline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="shift" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="LATAM" stackId="a" fill={AIRLINE_COLORS.LATAM} />
                <Bar dataKey="SKY" stackId="a" fill={AIRLINE_COLORS.SKY} />
                <Bar dataKey="JET SMART" stackId="a" fill={AIRLINE_COLORS["JET SMART"]} />
                <Bar dataKey="AVIANCA" stackId="a" fill={AIRLINE_COLORS.AVIANCA} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Filtro Activo */}
          {activeFilter && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>Filtrando por {activeFilter.type}: <strong>{activeFilter.value}</strong></span>
                <Button size="sm" variant="link" onClick={() => {
                  setActiveFilter(null);
                  setTableFilters((p) => ({ ...p, airline: "all", category: "all" }));
                }}>
                  Limpiar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Tabla */}
          <Card id="table">
            <CardHeader>
              <CardTitle>Registros Detallados</CardTitle>
              <CardDescription>{tableData.length} de {dateFiltered.length} registros</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg mb-4">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs">Buscar código</Label>
                  <Input placeholder="123456" value={tableFilters.search} onChange={(e) => setTableFilters({ ...tableFilters, search: e.target.value })} />
                </div>
                <div className="min-w-[150px]">
                  <Label className="text-xs">Aerolínea</Label>
                  <Select value={tableFilters.airline} onValueChange={(v) => setTableFilters({ ...tableFilters, airline: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                      <SelectItem value="SKY">SKY</SelectItem>
                      <SelectItem value="JET SMART">JET SMART</SelectItem>
                      <SelectItem value="AVIANCA">AVIANCA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[120px]">
                  <Label className="text-xs">Categoría</Label>
                  <Select value={tableFilters.category} onValueChange={(v) => setTableFilters({ ...tableFilters, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="A">A - Asa</SelectItem>
                      <SelectItem value="B">B - Maleta</SelectItem>
                      <SelectItem value="C">C - Rueda</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[120px]">
                  <Label className="text-xs">Turno</Label>
                  <Select value={tableFilters.shift} onValueChange={(v) => setTableFilters({ ...tableFilters, shift: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="BRC-ERC">BRC-ERC</SelectItem>
                      <SelectItem value="IRC-KRC">IRC-KRC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-[120px]">
                  <Label className="text-xs">Origen</Label>
                  <Select value={tableFilters.source} onValueChange={(v) => setTableFilters({ ...tableFilters, source: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="counter">Counter</SelectItem>
                      <SelectItem value="siberia">Siberia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={() => setTableFilters({ search: "", airline: "all", category: "all", shift: "all", source: "all" })}>
                  Limpiar
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Origen</TableHead>
                      <TableHead>Aerolínea</TableHead>
                      <TableHead>Categorías</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Turno</TableHead>
                      <TableHead>Firma</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono">{r.codigo}</TableCell>
                        <TableCell>
                          <Badge variant={r.source === "counter" ? "default" : "secondary"}>{r.source}</Badge>
                        </TableCell>
                        <TableCell>
                          {r.aerolinea ? (
                            <span className="px-2 py-1 rounded text-sm font-semibold" style={{ backgroundColor: `${AIRLINE_COLORS[r.aerolinea]}20`, color: AIRLINE_COLORS[r.aerolinea] }}>
                              {r.aerolinea}
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {r.categorias?.length > 0 ? (
                            <div className="flex gap-1">
                              {r.categorias.map((c: string) => (
                                <Badge key={c} className={CATEGORY_COLORS[c]}>{c}</Badge>
                              ))}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{r.usuario || "-"}</TableCell>
                        <TableCell>{r.turno ? <Badge variant="outline">{r.turno}</Badge> : "-"}</TableCell>
                        <TableCell>{r.firma ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}</TableCell>
                        <TableCell className="text-sm">{formatDateTime(r.fecha_hora)}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedRecord(r)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {tableData.length > recordsPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <p className="text-sm text-muted-foreground">
                    {(currentPage - 1) * recordsPerPage + 1} - {Math.min(currentPage * recordsPerPage, tableData.length)} de {tableData.length}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
                    <span className="text-sm px-3 flex items-center">Pág {currentPage} de {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Dialog de Detalles */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Registro</DialogTitle>
            <DialogDescription>{selectedRecord?.source} - {selectedRecord?.codigo}</DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Código</Label>
                  <p className="font-mono font-bold">{selectedRecord.codigo}</p>
                </div>
                {selectedRecord.aerolinea && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Aerolínea</Label>
                    <p className="font-semibold" style={{ color: AIRLINE_COLORS[selectedRecord.aerolinea] }}>{selectedRecord.aerolinea}</p>
                  </div>
                )}
                {selectedRecord.categorias?.length > 0 && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Categorías</Label>
                    <div className="flex gap-2 mt-1">
                      {selectedRecord.categorias.map((c: string) => (
                        <Badge key={c} className={CATEGORY_COLORS[c]}>{c} - {CATEGORY_LABELS[c]}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {selectedRecord.usuario && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Usuario</Label>
                    <p