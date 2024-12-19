'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getDashboardData } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";

export default function Dashboard() {
  const [data, setData] = useState({
    campuses: 0,
    users: 0,
    students: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await getDashboardData();
      setData(response);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  }
  return (
    <>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Planteles</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.campuses}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.users}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estudiantes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data.students}</p>
          </CardContent>
        </Card>
      </div></>
  );
}
