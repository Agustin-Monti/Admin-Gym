"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import HomeDashboard from "@/components/HomeDashboard";



export default function EjerciciosPage() {
  

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <div className="flex-1 ml-64">

        <div className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Home</h1>

          <HomeDashboard />
        </div>
      </div>
    </div>
  );
}
