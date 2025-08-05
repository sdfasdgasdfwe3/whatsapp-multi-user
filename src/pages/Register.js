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
  UserAddOutlined,
  LoginOutlined,
  PhoneOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import './Register.css';

const { Text } = Typography;

const Register = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // В реальном приложении здесь был бы запрос к серверу
      const userData = {
        username: values.username,
        name: values.fullName,
        phone: values.phone,
        id: Date.now()
      };
      
      onLogin(userData);
      message.success('Регистрация прошла успешно!');
    } catch (error) {
      message.error('Ошибка регистрации. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-background">
        <div className="register-overlay"></div>
      </div>
      
      <Row justify="center" align="middle" className="register-row">
        <Col xs={24} sm={20} md={16} lg={12} xl={8}>
          <Card className="register-card" bordered={false}>
            <div className="register-header">
              <h2 className="register-title">
                Создать аккаунт
              </h2>
              <Text type="secondary" className="register-subtitle">
                Заполните форму для регистрации
              </Text>
            </div>

            <Form
              name="register"
              onFinish={onFinish}
              size="large"
              className="register-form"
            >
              <Form.Item
                name="fullName"
                rules={[
                  { required: true, message: 'Пожалуйста, введите ФИО!' },
                  { min: 5, message: 'ФИО должно содержать минимум 5 символов!' }
                ]}
              >
                <Input 
                  prefix={<IdcardOutlined className="input-icon" />} 
                  placeholder="ФИО" 
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="username"
                rules={[
                  { required: true, message: 'Пожалуйста, введите логин!' },
                  { min: 3, message: 'Логин должен содержать минимум 3 символа!' }
                ]}
              >
                <Input 
                  prefix={<UserOutlined className="input-icon" />} 
                  placeholder="Логин" 
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: 'Пожалуйста, введите номер телефона!' },
                  { pattern: /^\+?[0-9\s\-()]{10,}$/, message: 'Введите корректный номер телефона!' }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined className="input-icon" />} 
                  placeholder="Номер телефона" 
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Пожалуйста, введите пароль!' },
                  { min: 6, message: 'Пароль должен содержать минимум 6 символов!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Пароль"
                  className="register-input"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Пожалуйста, подтвердите пароль!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Пароли не совпадают!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="Подтвердите пароль"
                  className="register-input"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<UserAddOutlined />}
                  className="register-button"
                  block
                >
                  Зарегистрироваться
                </Button>
              </Form.Item>
            </Form>

            <Divider>
              <Text type="secondary">или</Text>
            </Divider>

            <div className="register-footer">
              <Text type="secondary">Уже есть аккаунт? </Text>
              <Link to="/">
                <Button 
                  type="link" 
                  icon={<LoginOutlined />}
                  className="login-link"
                >
                  Войти
                </Button>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Register; 