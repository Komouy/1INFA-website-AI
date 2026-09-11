from fastapi import APIRouter, Request, Response, HTTPException, Query
from app.config import settings
from app.services.parser import process_incoming_text_message

router = APIRouter(prefix="/webhook/whatsapp", tags=["WhatsApp Cloud API Webhook"])

@router.get("")
def verify_whatsapp_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge")
):
    """
    Webhook verification endpoint for Meta WhatsApp Cloud API.
    """
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN:
        print("WhatsApp webhook verified successfully!")
        return Response(content=hub_challenge, media_type="text/plain")

    raise HTTPException(status_code=403, detail="Verification token mismatch")

@router.post("")
async def receive_whatsapp_webhook(request: Request):
    """
    Incoming WhatsApp Cloud API message handler.
    Extracts text/media and processes with Gemini pipeline.
    """
    body = await request.json()

    try:
        # Check if entry is present
        entries = body.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                messages = value.get("messages", [])
                contacts = value.get("contacts", [])
                
                sender_name = "WhatsApp User"
                if contacts and len(contacts) > 0:
                    sender_name = contacts[0].get("profile", {}).get("name") or contacts[0].get("wa_id") or "WhatsApp User"

                for msg in messages:
                    msg_id = msg.get("id")
                    msg_type = msg.get("type")

                    if msg_type == "text":
                        text_body = msg.get("text", {}).get("body", "")
                        print(f"Received WA Message from {sender_name}: {text_body}")
                        process_incoming_text_message(
                            sender=sender_name,
                            message_text=text_body,
                            whatsapp_message_id=msg_id
                        )

                    elif msg_type == "image":
                        # In production, image would be downloaded via Meta Graph API using msg.get("image", {}).get("id")
                        caption = msg.get("image", {}).get("caption", "Foto tanpa keterangan")
                        print(f"Received WA Image from {sender_name}: {caption}")
                        process_incoming_text_message(
                            sender=sender_name,
                            message_text=f"[Foto WhatsApp] {caption}",
                            whatsapp_message_id=msg_id
                        )

        return {"status": "received"}
    except Exception as e:
        print(f"Error handling WhatsApp webhook: {e}")
        return {"status": "error", "message": str(e)}
