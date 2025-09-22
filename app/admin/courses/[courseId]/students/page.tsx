'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Calendar, Eye, Download } from 'lucide-react';
import { motion } from 'framer-motion';

interface Student {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastActive?: string;
}

export default function CourseStudentsPage({ params }: { params: { courseId: string } }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const getCourseName = (courseId: string) => {
    const names = {
      'functional-basics': 'Functional Basics',
      'functional-flow': 'Functional Flow',
      'functional-energy': 'Functional Energy'
    };
    return names[courseId as keyof typeof names] || 'Kurs';
  };

  useEffect(() => {
    // Mock data för nu
    setTimeout(() => {
      setStudents([
        {
          id: '1',
          name: 'Anna Andersson',
          email: 'anna@example.com',
          enrolledAt: '2024-01-15',
          progress: 75,
          lastActive: '2024-01-20'
        },
        {
          id: '2',
          name: 'Erik Eriksson',
          email: 'erik@example.com',
          enrolledAt: '2024-01-10',
          progress: 50,
          lastActive: '2024-01-18'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-green)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Laddar kursdeltagare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin/courses"
            className="inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--primary-green)] mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tillbaka till kurser
          </Link>
          <h1 className="text-3xl font-light text-[var(--primary-green)] mb-2">
            {getCourseName(params.courseId)} - Deltagare
          </h1>
          <p className="text-[var(--text-secondary)]">
            {students.length} aktiva deltagare
          </p>
        </div>
        
        <button className="admin-btn admin-btn-secondary">
          <Download className="w-4 h-4" />
          Exportera lista
        </button>
      </div>

      {/* Students List */}
      <div className="admin-card">
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Deltagare</th>
                <th>Registrerad</th>
                <th>Framsteg</th>
                <th>Senast aktiv</th>
                <th>Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <td>
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">
                        {student.name}
                      </div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        {student.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
                      {new Date(student.enrolledAt).toLocaleDateString('sv-SE')}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[var(--primary-green)] h-2 rounded-full transition-all"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {student.progress}%
                      </span>
                    </div>
                  </td>
                  <td>
                    {student.lastActive ? (
                      new Date(student.lastActive).toLocaleDateString('sv-SE')
                    ) : (
                      <span className="text-[var(--text-secondary)]">Aldrig</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/users/${student.id}/edit`}
                        className="admin-btn admin-btn-secondary text-sm"
                      >
                        <Eye className="w-3 h-3" />
                        Visa
                      </Link>
                      <a
                        href={`mailto:${student.email}`}
                        className="admin-btn admin-btn-secondary text-sm"
                      >
                        <Mail className="w-3 h-3" />
                        Kontakta
                      </a>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
            Inga deltagare ännu
          </h3>
          <p className="text-[var(--text-secondary)]">
            Deltagare kommer att visas här när de registrerar sig för kursen
          </p>
        </div>
      )}
    </div>
  );
}
