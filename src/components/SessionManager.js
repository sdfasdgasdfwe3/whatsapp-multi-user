import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  Avatar,
  Tooltip,
  Modal,
  message,
  Row,
  Col,
  Statistic,
  Progress
} from 'antd';
import {
  UserOutlined,
  ClockCircleOutlined,
  DesktopOutlined,
  MobileOutlined,
  TabletOutlined,
  LogoutOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

const SessionManager = ({ user }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Имитация данных сессий
  useEffect(() => {
    const mockSessions = [
      {
        id: 1,
        userId: 1,
        username: 'ivan_petrov',
        name: 'Иван Петров',
        device: 'desktop',
        browser: 'Chrome',
        ip: '192.168.1.100',
        location: 'Москва, Россия',
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
        status: 'active',
        sessionDuration: '2ч 15м'
      },
      {
        id: 2,
        userId: 2,
        username: 'maria_sidorova',
        name: 'Мария Сидорова',
        device: 'mobile',
        browser: 'Safari',
        ip: '192.168.1.101',
        location: 'Санкт-Петербург, Россия',
        lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 минут назад
        status: 'active',
        sessionDuration: '45м'
      },
      {
        id: 3,
        userId: 3,
        username: 'alexey_kozlov',
        name: 'Алексей Козлов',
        device: 'tablet',
        browser: 'Firefox',
        ip: '192.168.1.102',
        location: 'Екатеринбург, Россия',
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 часа назад
        status: 'idle',
        sessionDuration: '1ч 30м'
      },
      {
        id: 4,
        userId: 4,
        username: 'elena_vorobyeva',
        name: 'Елена Воробьева',
        device: 'desktop',
        browser: 'Edge',
        ip: '192.168.1.103',
        location: 'Новосибирск, Россия',
        lastActivity: new Date(Date.now() - 10 * 60 * 1000), // 10 минут назад
        status: 'active',
        sessionDuration: '3ч 20м'
      }
    ];

    setSessions(mockSessions);
  }, []);

  const getDeviceIcon = (device) => {
    switch (device) {
      case 'desktop':
        return <DesktopOutlined />;
      case 'mobile':
        return <MobileOutlined />;
      case 'tablet':
        return <TabletOutlined />;
      default:
        return <DesktopOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'idle':
        return 'orange';
      case 'inactive':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Активна';
      case 'idle':
        return 'Неактивна';
      case 'inactive':
        return 'Завершена';
      default:
        return 'Неизвестно';
    }
  };

  const handleViewSession = (session) => {
    setSelectedSession(session);
  };

  const handleTerminateSession = (sessionId) => {
    Modal.confirm({
      title: 'Завершить сессию',
      content: 'Вы уверены, что хотите завершить эту сессию?',
      onOk: () => {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        message.success('Сессия завершена');
      }
    });
  };

  const handleRefreshSessions = () => {
    setLoading(true);
    // Имитация обновления данных
    setTimeout(() => {
      setLoading(false);
      message.success('Данные обновлены');
    }, 1000);
  };

  const columns = [
    {
      title: 'Пользователь',
      key: 'user',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary">@{record.username}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Устройство',
      key: 'device',
      render: (_, record) => (
        <Space>
          {getDeviceIcon(record.device)}
          <Text>{record.browser}</Text>
        </Space>
      ),
    },
    {
      title: 'IP адрес',
      dataIndex: 'ip',
      key: 'ip',
    },
    {
      title: 'Местоположение',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Последняя активность',
      key: 'lastActivity',
      render: (_, record) => {
        const minutes = Math.floor((Date.now() - record.lastActivity.getTime()) / (1000 * 60));
        return (
          <Space>
            <ClockCircleOutlined />
            <Text>{minutes} мин назад</Text>
          </Space>
        );
      },
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Tag color={getStatusColor(record.status)}>
          {getStatusText(record.status)}
        </Tag>
      ),
    },
    {
      title: 'Длительность',
      dataIndex: 'sessionDuration',
      key: 'sessionDuration',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Просмотреть детали">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewSession(record)}
            />
          </Tooltip>
          <Tooltip title="Завершить сессию">
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={() => handleTerminateSession(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const activeSessions = sessions.filter(s => s.status === 'active');
  const totalSessions = sessions.length;

  return (
    <div className="session-manager">
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Всего сессий"
              value={totalSessions}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Активных сессий"
              value={activeSessions.length}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Процент активности"
              value={totalSessions > 0 ? Math.round((activeSessions.length / totalSessions) * 100) : 0}
              suffix="%"
              prefix={<Progress type="circle" size={40} percent={totalSessions > 0 ? (activeSessions.length / totalSessions) * 100 : 0} />}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Управление сессиями"
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRefreshSessions}
            loading={loading}
          >
            Обновить
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={sessions}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} сессий`
          }}
        />
      </Card>

      <Modal
        title="Детали сессии"
        open={!!selectedSession}
        onCancel={() => setSelectedSession(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedSession(null)}>
            Закрыть
          </Button>,
          <Button 
            key="terminate" 
            danger 
            icon={<LogoutOutlined />}
            onClick={() => {
              if (selectedSession) {
                handleTerminateSession(selectedSession.id);
                setSelectedSession(null);
              }
            }}
          >
            Завершить сессию
          </Button>
        ]}
        width={600}
      >
        {selectedSession && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Пользователь:</Text>
                <br />
                <Text>{selectedSession.name} (@{selectedSession.username})</Text>
              </Col>
              <Col span={12}>
                <Text strong>Устройство:</Text>
                <br />
                <Space>
                  {getDeviceIcon(selectedSession.device)}
                  <Text>{selectedSession.browser}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Text strong>IP адрес:</Text>
                <br />
                <Text>{selectedSession.ip}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Местоположение:</Text>
                <br />
                <Text>{selectedSession.location}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Статус:</Text>
                <br />
                <Tag color={getStatusColor(selectedSession.status)}>
                  {getStatusText(selectedSession.status)}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Длительность:</Text>
                <br />
                <Text>{selectedSession.sessionDuration}</Text>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SessionManager; 