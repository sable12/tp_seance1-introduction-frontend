import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

interface Project { id: string; name: string; color: string; }
interface SidebarProps {
  projects: Project[];
  isOpen: boolean;
  onRename?: (project: Project) => void;
  onDelete?: (id: string) => void;
}

function Sidebar({ projects, isOpen, onRename, onDelete }: SidebarProps) {
  console.log('Sidebar re-render');
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <h2 className={styles.title}>Mes Projets</h2>
      <ul className={styles.list}>
        {projects.map(p => (
          <li key={p.id} className={styles.listItem}>
            <NavLink
              to={`/projects/${p.id}`}
              className={({ isActive }) =>
                `${styles.item} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.dot} style={{ background: p.color }} />
              {p.name}
            </NavLink>
            <div className={styles.actions}>
              {onRename && (
                <button
                  className={styles.actionBtn}
                  onClick={e => { e.preventDefault(); onRename(p); }}
                  title="Renommer"
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  className={styles.actionBtn}
                  onClick={e => { e.preventDefault(); onDelete(p.id); }}
                  title="Supprimer"
                >
                  🗑️
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default memo(Sidebar);
