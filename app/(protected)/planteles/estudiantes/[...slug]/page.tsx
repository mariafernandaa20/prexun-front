import React from 'react';
import { StudentComponent } from './student-component';

export default async function EstudentPage({ params }) {
  return <StudentComponent {...params} />;
}
