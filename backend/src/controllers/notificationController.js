const Notification = require('../models/notification');

exports.listNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll();
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao obter notificações.' });
  }
};

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (notification) return res.json({ success: true, data: notification });
    return res.status(404).json({ success: false, error: 'Notificação não encontrada.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao obter notificação.' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    return res.status(201).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao criar notificação.' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) return res.status(404).json({ success: false, error: 'Notificação não encontrada.' });

    await notification.destroy();
    return res.status(200).json({ success: true, message: 'Notificação eliminada com sucesso.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Erro ao eliminar notificação.' });
  }
};