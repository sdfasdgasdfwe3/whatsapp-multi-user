import React from 'react';
import { 
  Layout, 
  Typography, 
  Button, 
  Card, 
  Row, 
  Col, 
  Space,
  Avatar,
  Divider,
  Tag
} from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  HomeOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
  CrownOutlined,
  SettingOutlined,
  SecurityScanOutlined,
  DashboardOutlined,
  MessageOutlined
} from '@ant-design/icons';
import './Home.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

const Home = ({ user, onLogout }) => {
  const handleLogout = () => {
    onLogout();
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Layout className="home-layout">
      <Header className="home-header">
        <div className="header-content">
          <div className="header-left">
            <HomeOutlined className="header-icon" />
            <Title level={3} className="header-title">
              Мой сайт
            </Title>
          </div>
          <div className="header-right">
            <Space>
              <Avatar 
                icon={isAdmin ? <CrownOutlined /> : <UserOutlined />} 
                className={`user-avatar ${isAdmin ? 'admin-avatar' : ''}`}
              />
              <div className="user-info">
                <Text className="user-name">
                  {user?.name || 'Пользователь'}
                </Text>
                {isAdmin && (
                  <Tag color="gold" icon={<CrownOutlined />} className="admin-tag">
                    Администратор
                  </Tag>
                )}
              </div>
              <Button 
                type="text" 
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                className="logout-button"
              >
                Выйти
              </Button>
            </Space>
          </div>
        </div>
      </Header>

      <Content className="home-content">
        <div className="welcome-section">
          <Row justify="center">
            <Col xs={24} md={20} lg={16}>
              <Card className="welcome-card" bordered={false}>
                <div className="welcome-content">
                  <Avatar 
                    size={80} 
                    icon={isAdmin ? <CrownOutlined /> : <UserOutlined />} 
                    className={`welcome-avatar ${isAdmin ? 'admin-avatar' : ''}`}
                  />
                  <Title level={1} className="welcome-title">
                    Добро пожаловать, {user?.name || 'Пользователь'}!
                  </Title>
                  {isAdmin ? (
                    <Paragraph className="welcome-text admin-welcome">
                      Вы вошли как администратор системы. У вас есть полный доступ ко всем функциям 
                      и возможность управления пользователями и настройками.
                    </Paragraph>
                  ) : (
                    <Paragraph className="welcome-text">
                      Вы успешно вошли в систему. Здесь вы можете управлять своим профилем 
                      и получить доступ ко всем функциям нашего сайта.
                    </Paragraph>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {isAdmin && (
          <div className="admin-section">
            <Row justify="center">
              <Col xs={24} md={20} lg={16}>
                <Card className="admin-card" bordered={false}>
                  <div className="admin-content">
                    <Title level={3} className="admin-title">
                      <CrownOutlined /> Панель администратора
                    </Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12}>
                        <Card className="admin-feature-card" bordered={false}>
                          <div className="admin-feature-content">
                            <SettingOutlined className="admin-feature-icon" />
                            <Title level={5} className="admin-feature-title">
                              Управление системой
                            </Title>
                            <Text className="admin-feature-text">
                              Настройка параметров и конфигурации системы
                            </Text>
                          </div>
                        </Card>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Card className="admin-feature-card" bordered={false}>
                          <div className="admin-feature-content">
                            <SecurityScanOutlined className="admin-feature-icon" />
                            <Title level={5} className="admin-feature-title">
                              Безопасность
                            </Title>
                            <Text className="admin-feature-text">
                              Мониторинг безопасности и управление доступом
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <div className="features-section">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-content">
                  <HeartOutlined className="feature-icon" />
                  <Title level={4} className="feature-title">
                    Персональный подход
                  </Title>
                  <Text className="feature-text">
                    Мы заботимся о каждом пользователе и предоставляем индивидуальный подход.
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-content">
                  <StarOutlined className="feature-icon" />
                  <Title level={4} className="feature-title">
                    Высокое качество
                  </Title>
                  <Text className="feature-text">
                    Наш сервис обеспечивает высокое качество и надежность работы.
                  </Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} sm={12} lg={8}>
              <Card className="feature-card" bordered={false}>
                <div className="feature-content">
                  <TrophyOutlined className="feature-icon" />
                  <Title level={4} className="feature-title">
                    Лучшие решения
                  </Title>
                  <Text className="feature-text">
                    Мы предлагаем инновационные решения для ваших задач.
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="dashboard-section">
          <Row justify="center">
            <Col xs={24} md={16} lg={12}>
              <Card className="dashboard-card" bordered={false}>
                <div className="dashboard-content">
                  <DashboardOutlined className="dashboard-icon" />
                  <Title level={3} className="dashboard-title">
                    Панель управления
                  </Title>
                  <Text className="dashboard-text">
                    {isAdmin 
                      ? 'Управляйте чатами, группами и сессиями пользователей. Отправляйте информацию о продукции и статьи выбранным пользователям.'
                      : 'Просматривайте ваши чаты и группы. Получайте информацию о продукции и статьи.'
                    }
                  </Text>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<MessageOutlined />}
                    onClick={handleGoToDashboard}
                    className="dashboard-button"
                  >
                    {isAdmin ? 'Перейти к панели управления' : 'Открыть чаты'}
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        <div className="stats-section">
          <Row gutter={[24, 24]} justify="center">
            <Col xs={24} md={8}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <Title level={2} className="stat-number">1000+</Title>
                  <Text className="stat-label">Довольных клиентов</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <Title level={2} className="stat-number">99.9%</Title>
                  <Text className="stat-label">Время работы</Text>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card className="stat-card" bordered={false}>
                <div className="stat-content">
                  <Title level={2} className="stat-number">24/7</Title>
                  <Text className="stat-label">Поддержка</Text>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer className="home-footer">
        <div className="footer-content">
          <Text className="footer-text">
            © 2024 Мой сайт. Все права защищены.
          </Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default Home; 