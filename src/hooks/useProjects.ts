import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import axios from 'axios';

export interface Project { id: string; name: string; color: string; }
export interface Column { id: string; title: string; tasks: string[]; }

export default function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, colRes] = await Promise.all([
          api.get('/projects'),
          api.get('/columns'),
        ]);
        setProjects(projRes.data);
        setColumns(colRes.data);
      } catch (err) {
        setError('Erreur chargement');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addProject = useCallback(async (name: string, color: string) => {
    setSaving(true);
    setError(null);
    try {
      const { data } = await api.post('/projects', { name, color });
      setProjects(prev => [...prev, data]);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Erreur: ${err.response?.status}`);
      } else {
        setError('Erreur inconnue');
      }
    } finally {
      setSaving(false);
    }
  }, []);

  const renameProject = useCallback(async (project: Project) => {
    const newName = prompt('Nouveau nom :', project.name);
    if (!newName || newName === project.name) return;
    try {
      const { data } = await api.put(`/projects/${project.id}`, { ...project, name: newName });
      setProjects(prev => prev.map(p => p.id === data.id ? data : p));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Erreur: ${err.response?.status}`);
      } else {
        setError('Erreur inconnue');
      }
    }
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    if (!confirm('Êtes-vous sûr ?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(`Erreur: ${err.response?.status}`);
      } else {
        setError('Erreur inconnue');
      }
    }
  }, []);

  return {
    projects,
    columns,
    loading,
    saving,
    error,
    addProject,
    renameProject,
    deleteProject,
  };
}
