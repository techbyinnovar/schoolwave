"use client";
import React, { useState, useEffect } from 'react';

// Import UI components
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

// Define types
interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
}

interface Term {
  id: string;
  name: string;
  academicYearId: string;
}

export default function AcademicSettings() {
  // State for new year input
  const [yearName, setYearName] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  // State for academic years and terms
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch academic years and terms from backend
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setError(null);
      try {
        const [yearsRes, termsRes] = await Promise.all([
          fetch('/api/setting?key=academic_years'),
          fetch('/api/setting?key=terms'),
        ]);
        const yearsData = await yearsRes.json();
        const termsData = await termsRes.json();
        setAcademicYears(yearsData.value || []);
        setTerms(termsData.value || []);
      } catch (err: any) {
        setError('Failed to load academic settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Helper to persist data to backend
  const persistSetting = async (key: string, value: any) => {
    try {
      await fetch('/api/setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
    } catch {
      setError('Failed to save settings.');
    }
  };

  // Add a new academic year with default terms
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearName.trim()) return;

    const newYear: AcademicYear = {
      id: Date.now().toString(),
      name: yearName.trim(),
      isCurrent
    };
    const defaultTerms: Term[] = [
      { id: `${newYear.id}-1`, name: '1st Term', academicYearId: newYear.id },
      { id: `${newYear.id}-2`, name: '2nd Term', academicYearId: newYear.id },
      { id: `${newYear.id}-3`, name: '3rd Term', academicYearId: newYear.id }
    ];

    // If this new year is set as current, unset others
    const updatedYears = [
      ...academicYears.map(year => ({ ...year, isCurrent: false })),
      newYear
    ];
    const updatedTerms = [...terms, ...defaultTerms];
    setAcademicYears(updatedYears);
    setTerms(updatedTerms);
    await persistSetting('academic_years', updatedYears);
    await persistSetting('terms', updatedTerms);

    setYearName('');
    setIsCurrent(false);
  };

  // Toggle current year (select exactly one)
  const toggleCurrentYear = async (yearId: string) => {
    const updatedYears = academicYears.map(year => ({
      ...year,
      isCurrent: year.id === yearId,
    }));
    setAcademicYears(updatedYears);
    await persistSetting('academic_years', updatedYears);
  };

  // Delete a year and its terms
  const deleteYear = async (yearId: string) => {
    const updatedYears = academicYears.filter(year => year.id !== yearId);
    const updatedTerms = terms.filter(term => term.academicYearId !== yearId);
    setAcademicYears(updatedYears);
    setTerms(updatedTerms);
    await persistSetting('academic_years', updatedYears);
    await persistSetting('terms', updatedTerms);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Academic Years & Terms</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column for forms */}
        <div className="lg:col-span-1 space-y-6">
          {/* Academic Years Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Academic Years</h3>
            <form onSubmit={handleAddYear} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="yearName">Year Name</Label>
                <Input
                  id="yearName"
                  placeholder="e.g. 2024/2025"
                  value={yearName}
                  onChange={e => setYearName(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={isCurrent}
                  onChange={e => setIsCurrent(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="isCurrent" className="text-sm font-medium text-gray-700">
                  Set as current academic year
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Add Academic Year
              </Button>
            </form>
          </div>
        </div>

        {/* Right column for lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Academic Years List */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Academic Years List</h3>
            {academicYears.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3" />
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {academicYears.map((ay) => (
                      <tr key={ay.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ay.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {ay.isCurrent ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => toggleCurrentYear(ay.id)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm"
                              aria-label={`Set ${ay.name} as current year`}
                            >
                              Set Current
                            </button>
                          )}
                        </td>
                        <td></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <button
                            onClick={() => deleteYear(ay.id)}
                            className="text-red-600 hover:text-red-900"
                            aria-label={`Delete ${ay.name}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No academic years added yet. Add one to get started.
              </div>
            )}
          </div>

          {/* Terms List */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Terms List</h3>
            {terms.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Term
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Academic Year
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {terms.map((term) => {
                      const academicYear = academicYears.find(ay => ay.id === term.academicYearId);
                      return (
                        <tr key={term.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`${term.name}${academicYear ? `-${academicYear.name}` : ''}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{academicYear?.name || 'N/A'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No terms available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
