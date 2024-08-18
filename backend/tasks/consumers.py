# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Erstelle einen Channel-Name
        self.group_name = 'notifications'

        # Tritt der Gruppe bei
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Verlasse die Gruppe
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Simuliert eine Benachrichtigung
        await self.send(text_data=json.dumps({
            'type': 'new_task_notification',
            'message': 'Hier ist eine neue Benachrichtigung!'
        }))

    async def send_notification(self, event):
        # Sende die Nachricht an den WebSocket-Client
        message = event['message']
        await self.send(text_data=json.dumps(message))
