import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Button,
  Input,
  Modal,
  Form,
  Select,
  Tag,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
  Avatar,
  Checkbox,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  MessageOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { Option } = Select;

const ChatManager = ({ user }) => {
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [groupForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  
  const isAdmin = user?.role === 'admin';

  // Имитация данных чатов и групп
  useEffect(() => {
    // Имитация загрузки чатов
    const mockChats = [
      { id: 1, name: 'Иван Петров', type: 'private', lastMessage: 'Привет!', unread: 2 },
      { id: 2, name: 'Мария Сидорова', type: 'private', lastMessage: 'Спасибо за информацию', unread: 0 },
      { id: 3, name: 'Алексей Козлов', type: 'private', lastMessage: 'Интересно узнать больше', unread: 1 },
      { id: 4, name: 'Елена Воробьева', type: 'private', lastMessage: 'Готов к сотрудничеству', unread: 0 },
    ];

    // Имитация загрузки групп
    const mockGroups = [
      { id: 1, name: 'Продажи', members: 15, type: 'group', description: 'Группа отдела продаж' },
      { id: 2, name: 'Маркетинг', members: 8, type: 'group', description: 'Маркетинговая команда' },
      { id: 3, name: 'VIP клиенты', members: 25, type: 'group', description: 'Премиум клиенты' },
      { id: 4, name: 'Новые клиенты', members: 42, type: 'group', description: 'Недавно зарегистрированные' },
    ];

    setChats(mockChats);
    setGroups(mockGroups);
  }, []);

  const handleChatSelect = (chatId) => {
    setSelectedChats(prev => 
      prev.includes(chatId) 
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleGroupSelect = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSendMessage = (content, type) => {
    const selectedItems = type === 'chat' ? selectedChats : selectedGroups;
    
    if (selectedItems.length === 0) {
      message.warning('Выберите хотя бы один чат или группу для отправки');
      return;
    }

    // Имитация отправки сообщения
    message.success(`Сообщение отправлено в ${selectedItems.length} ${type === 'chat' ? 'чат(ов)' : 'групп(у)'}`);
    
    // Очистка выбора
    if (type === 'chat') {
      setSelectedChats([]);
    } else {
      setSelectedGroups([]);
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="chat-manager">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={isAdmin ? 12 : 24}>
          <Card 
            title={
              <Space>
                <MessageOutlined />
                <Text strong>{isAdmin ? 'Чаты пользователей' : 'Мои чаты'}</Text>
                {isAdmin && <Tag color="blue">{selectedChats.length} выбрано</Tag>}
              </Space>
            }
            extra={
              isAdmin ? (
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage('product_info', 'chat')}
                  disabled={selectedChats.length === 0}
                >
                  Отправить
                </Button>
              ) : null
            }
          >
            <Input
              placeholder="Поиск чатов..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            
            <List
              dataSource={filteredChats}
              renderItem={(chat) => (
                <List.Item
                  className={`chat-item ${selectedChats.includes(chat.id) ? 'selected' : ''}`}
                  onClick={() => handleChatSelect(chat.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<UserOutlined />} />
                    }
                    title={
                      <Space>
                        <Text strong>{chat.name}</Text>
                        {chat.unread > 0 && (
                          <Tag color="red">{chat.unread}</Tag>
                        )}
                      </Space>
                    }
                    description={chat.lastMessage}
                  />
                  <Checkbox checked={selectedChats.includes(chat.id)} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {isAdmin && (
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <TeamOutlined />
                  <Text strong>Группы</Text>
                  <Tag color="green">{selectedGroups.length} выбрано</Tag>
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage('product_info', 'group')}
                  disabled={selectedGroups.length === 0}
                >
                  Отправить
                </Button>
              }
            >
            <List
              dataSource={filteredGroups}
              renderItem={(group) => (
                <List.Item
                  className={`group-item ${selectedGroups.includes(group.id) ? 'selected' : ''}`}
                  onClick={() => handleGroupSelect(group.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={<TeamOutlined />} />
                    }
                    title={
                      <Space>
                        <Text strong>{group.name}</Text>
                        <Tag color="blue">{group.members} участников</Tag>
                      </Space>
                    }
                    description={group.description}
                  />
                  <Checkbox checked={selectedGroups.includes(group.id)} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        )}
      </Row>

      {isAdmin && (
        <>
          <Divider />

          <Card title="Быстрая отправка">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Button 
                  type="primary" 
                  block 
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage('product_info', 'all')}
                  disabled={selectedChats.length === 0 && selectedGroups.length === 0}
                >
                  Отправить информацию о продукции
                </Button>
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  type="primary" 
                  block 
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage('article_info', 'all')}
                  disabled={selectedChats.length === 0 && selectedGroups.length === 0}
                >
                  Отправить статьи
                </Button>
              </Col>
              <Col xs={24} md={8}>
                <Button 
                  type="primary" 
                  block 
                  icon={<SendOutlined />}
                  onClick={() => handleSendMessage('promotion_info', 'all')}
                  disabled={selectedChats.length === 0 && selectedGroups.length === 0}
                >
                  Отправить акции
                </Button>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default ChatManager; 