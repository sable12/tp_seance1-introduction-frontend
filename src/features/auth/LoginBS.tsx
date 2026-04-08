import { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { loginStart, loginSuccess, loginFailure } from './authSlice';
import api from '../../api/axios';

export default function LoginBS() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const { data: users } = await api.get(`/users?email=${email}`);

      if (users.length === 0 || users[0].password !== password) {
        dispatch(loginFailure('Email ou mot de passe incorrect'));
        return;
      }

      const { password: _, ...userData } = users[0];
      const fakeToken = btoa(
        JSON.stringify({
          userId: userData.id,
          email: userData.email,
          role: 'admin',
          exp: Date.now() + 3600000,
        })
      );

      dispatch(loginSuccess({ user: userData, token: fakeToken }));
      navigate(from, { replace: true });
    } catch {
      dispatch(loginFailure('Erreur serveur'));
    }
  }

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ height: '100vh' }}
    >
      <Card style={{ maxWidth: 400, width: '100%' }}>
        <Card.Body>
          <Card.Title className="text-center" style={{ color: '#1B8C3E' }}>
            TaskFlow
          </Card.Title>

          <Card.Text className="text-center mb-4 text-secondary">
            Connectez-vous pour continuer
          </Card.Text>

          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button variant="success" type="submit" className="w-100" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
