import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider,
  message,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import './Login.css';

const { Text } = Typography;

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Проверка для входа с admin/1234
      if (values.username === 'admin' && values.password === '1234') {
        const userData = {
          username: values.username,
          name: 'Администратор',
          id: 'admin-001',
          role: 'admin'
        };
        onLogin(userData);
        message.success('Успешный вход в систему как администратор!');
        return;
      }
      
      // Обычная логика для входа
      const userData = {
        username: values.username,
        name: values.username,
        id: Date.now(),
        role: 'user'
      };
      onLogin(userData);
      message.success('Успешный вход в систему!');
    } catch (error) {
      message.error('Ошибка входа. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <Row justify="center" align="middle" className="login-row">
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card className="login-card" bordered={false}>
            <div className="login-header">
              <h2 className="login-title">
                Войдите в свою учетную запись
              </h2>
            </div>

            <Form
              name="login"
              onFinish={onFinish}
              size="large"
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Пожалуйста, введите логин!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="Логин" 
                  className="login-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Пожалуйста, введите пароль!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Пароль"
                  className="login-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<LoginOutlined />}
                  className="login-button"
                  block
                >
                  Войти
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">или</Text>
            </Divider>

            <div className="login-footer">
              <Text type="secondary">Нет учетной записи? </Text>
              <Link to="/register">
                <Button 
                  type="link" 
                  icon={<UserAddOutlined />}
                  className="register-link"
                >
                  Зарегистрироваться
                </Button>
              </Link>
            </div>

            <div className="demo-credentials">
              <Text type="secondary" className="demo-text">
                Демо доступ: admin / 1234
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login; 