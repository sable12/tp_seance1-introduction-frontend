import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../features/auth/authSlice';
import useProjects from '../hooks/useProjects';
import type { Project } from '../hooks/useProjects';
import HeaderBS from '../components/HeaderBS';
import Sidebar from '../components/Sidebar';
import MainContent from '../components/MainContent';
import ProjectForm from '../components/ProjectForm';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const dispatch = useDispatch();
  const userName = useSelector((state: RootState) => state.auth.user?.name);
  const { projects, columns, loading, saving, error, addProject, renameProject, deleteProject } =
    useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const handleRename = useCallback(
    (project: Project) => {
      renameProject(project);
    },
    [renameProject]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteProject(id);
    },
    [deleteProject]
  );

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.layout}>
      <HeaderBS
        title="TaskFlow"
        onMenuClick={() => setSidebarOpen(p => !p)}
        userName={userName}
        onLogout={() => dispatch(logout())}
      />
      <div className={styles.body}>
        <Sidebar projects={projects} isOpen={sidebarOpen} onRename={handleRename} onDelete={handleDelete} />
        <div className={styles.content}>
          <div className={styles.toolbar}>
            {error && <div className={styles.error}>{error}</div>}
            {!showForm ? (
              <button
                className={styles.addBtn}
                onClick={() => setShowForm(true)}
                disabled={saving}
              >
                + Nouveau projet
              </button>
            ) : (
              <ProjectForm
                submitLabel="Créer"
                onSubmit={(name, color) => {
                  addProject(name, color);
                  setShowForm(false);
                }}
                onCancel={() => setShowForm(false)}
              />
            )}
          </div>
          <MainContent columns={columns} />
        </div>
      </div>
    </div>
  );
}
