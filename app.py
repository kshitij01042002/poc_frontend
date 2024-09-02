from flask import Flask, render_template, request, json, Response
# from vapi_python import Vapi
from flask_cors import CORS
import queue
import time

app = Flask(__name__)
# vapi = Vapi(api_key='661f7649-d7eb-408c-b559-5dcb41b72531')
CORS(app)
# vapi = Vapi(api_key='661f7649-d7eb-408c-b559-5dcb41b72531')


# Queue to store the latest user info
user_info_queue = queue.Queue(maxsize=1)

@app.route('/', methods=['POST'])
def index():
    if request.method == 'POST':
        data = request.get_json()
        user_info = data['message']['toolCalls'][0]['function']['arguments']
        print(user_info)

        # if user_info['isProcessing']:
        #     # List of required fields
        #     required_fields = ['Name', 'Vehicle Type', 'Mobile Number', 'Email Address', 'Date of birth', 'Add-On Offer', 'isKYCAvailable']
            
        #     # Check if all required fields are filled
        #     missing_fields = [field for field in required_fields if user_info.get(field) is None or user_info.get(field) == '']

        #     if missing_fields:
        #         return f"Error: The following fields are missing or empty: {', '.join(missing_fields)}", 400
        

        # Update the queue with the latest user info
        if user_info_queue.full():
            user_info_queue.get()  # Remove old data if queue is full
        user_info_queue.put(user_info)

        return "Data received successfully", 200
        

@app.route('/stream')
def stream():
    def event_stream():
        initial_data_sent = False
        while True:
            if not initial_data_sent and not user_info_queue.empty():
                # Send the initial data if available
                user_info = user_info_queue.get()
                yield f"data: {json.dumps(user_info)}\n\n"
                initial_data_sent = True
            elif not user_info_queue.empty():
                # Send new data as it becomes available
                user_info = user_info_queue.get()
                yield f"data: {json.dumps(user_info)}\n\n"
            else:
                # No data available, wait a bit before checking again
                time.sleep(0.1)

    return Response(event_stream(), content_type='text/event-stream')

@app.route('/whole', methods=['POST'])
def whole():
    data = request.get_json()
    user_info = data['message']['toolCalls'][0]['function']['arguments']
    print(user_info)

    return "Data received successfully", 200

@app.route('/stop')
def stop():
    try:
        vapi.stop()
        return "1"
    except Exception as e:
        print(f"Error starting Vapi: {e}")
        return "Error starting Vapi", 500
    

def handle_message(message):
    """
    Handle the 'message' event emitted by the Vapi object.
    """
    print(f"Received message: {message}")
    if message.get('type') == 'user-interrupted':
        print('User interrupted the assistant')
        vapi.send({
            "type": "add-message",
            "message": {
                "role": "user",
                "content": "Pause the conversation. and don't speak till I explicitly start talking to you. I am busy with some other work. Don't mention anything on the context provided.",
            },
        })

if __name__ == '__main__':
    app.run(debug=True)