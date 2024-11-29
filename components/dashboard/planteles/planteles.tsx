"use client";

import { useState } from "react";
import { School, sampleSchools } from "@/lib/types";
import { SchoolTable } from "./plantel-table";
import { PlantelForm } from "./plantel-form";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function PlantelesInicio() {
  const [schools, setSchools] = useState<School[]>(sampleSchools);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addSchool = (school: Omit<School, "id">) => {
    const newSchool = { ...school, id: Date.now().toString() };
    setSchools([...schools, newSchool]);
    setIsDialogOpen(false);
  };

  const updateSchool = (updatedSchool: School) => {
    setSchools(
      schools.map((school) =>
        school.id === updatedSchool.id ? updatedSchool : school
      )
    );
    setEditingSchool(null);
    setIsDialogOpen(false);
  };

  const deleteSchool = (id: string) => {
    setSchools(schools.filter((school) => school.id !== id));
  };

  const openNewSchoolDialog = () => {
    setEditingSchool({
      id: "",
      name: "",
      administrator: "",
      location: "",
      studentCount: 0,
    });
    setIsDialogOpen(true);
  };

  const openEditSchoolDialog = (school: School) => {
    setEditingSchool(school);
    setIsDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={openNewSchoolDialog}>
          <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Plantel
        </Button>
      </div>
      <SchoolTable
        schools={schools}
        onEdit={openEditSchoolDialog}
        onDelete={deleteSchool}
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSchool?.id ? "Editar Plantel" : "Nuevo Plantel"}</DialogTitle>
          </DialogHeader>
          {editingSchool && (
            <PlantelForm
              school={editingSchool}
              onSave={editingSchool.id ? updateSchool : addSchool}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

