import React, { useState } from 'react';
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
  Tabs,
  Statistic,
  Tag
} from 'antd';
import { 
  LogoutOutlined, 
  UserOutlined, 
  HomeOutlined,
  MessageOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SettingOutlined,
  DashboardOutlined,
  SendOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import ChatManager from '../components/ChatManager';
import SessionManager from '../components/SessionManager';
import './Dashboard.css';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('chats');

  const handleLogout = () => {
    onLogout();
  };

  const isAdmin = user?.role === 'admin';
  
  // Для обычных пользователей показываем только вкладку чатов
  useEffect(() => {
    if (!isAdmin) {
      setActiveTab('chats');
    }
  }, [isAdmin]);

  const tabItems = isAdmin ? [
    {
      key: 'chats',
      label: (
        <Space>
          <MessageOutlined />
          Управление чатами
        </Space>
      ),
      children: <ChatManager user={user} />
    },
    {
      key: 'sessions',
      label: (
        <Space>
          <ClockCircleOutlined />
          Сессии пользователей
        </Space>
      ),
      children: <SessionManager user={user} />
    }
  ] : [
    {
      key: 'chats',
      label: (
        <Space>
          <MessageOutlined />
          Мои чаты
        </Space>
      ),
      children: <ChatManager user={user} />
    }
  ];

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <DashboardOutlined className="header-icon" />
            <Title level={3} className="header-title">
              Панель управления
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

      <Content className="dashboard-content">
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
                    Панель управления, {user?.name || 'Пользователь'}!
                  </Title>
                  {isAdmin ? (
                    <Paragraph className="welcome-text admin-welcome">
                      Управляйте чатами, группами и сессиями пользователей. Отправляйте информацию 
                      о продукции и статьи выбранным пользователям.
                    </Paragraph>
                  ) : (
                    <Paragraph className="welcome-text">
                      Здесь вы можете управлять своими чатами и просматривать активные сессии.
                    </Paragraph>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {isAdmin && (
          <div className="stats-section">
            <Row gutter={[24, 24]} justify="center">
              <Col xs={24} sm={8}>
                <Card className="stat-card" bordered={false}>
                  <div className="stat-content">
                    <Statistic
                      title="Активных пользователей"
                      value={156}
                      prefix={<UserOutlined />}
                      valueStyle={{ color: '#3f8600' }}
                    />
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={8}>
                <Card className="stat-card" bordered={false}>
                  <div className="stat-content">
                    <Statistic
                      title="Активных чатов"
                      value={42}
                      prefix={<MessageOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={8}>
                <Card className="stat-card" bordered={false}>
                  <div className="stat-content">
                    <Statistic
                      title="Групп"
                      value={8}
                      prefix={<TeamOutlined />}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}

        <div className="main-content">
          <Row justify="center">
            <Col xs={24} md={20} lg={16}>
              <Card className="main-card" bordered={false}>
                <Tabs 
                  activeKey={activeTab} 
                  onChange={setActiveTab}
                  items={tabItems}
                  className="dashboard-tabs"
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      <Footer className="dashboard-footer">
        <div className="footer-content">
          <Text className="footer-text">
            © 2024 Панель управления. Все права защищены.
          </Text>
        </div>
      </Footer>
    </Layout>
  );
};

export default Dashboard; 