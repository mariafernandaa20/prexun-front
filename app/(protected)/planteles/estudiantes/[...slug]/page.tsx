import React from 'react';
import { StudentComponent } from './student';

export default async function EstudentPage({ params }) {
  return <StudentComponent {...params} />;
}
