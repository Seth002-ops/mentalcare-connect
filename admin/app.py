from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_cors import CORS
from functools import wraps
from models import db, User, Message, SessionBooking
from config import config
import os

def create_app(config_name='development'):
    app = Flask(__name__, template_folder='templates', static_folder='static')
    app.config.from_object(config[config_name])
    
    CORS(app)
    db.init_app(app)
    
    with app.app_context():
        db.create_all()
    
    # Authentication decorator
    def login_required(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'admin_logged_in' not in session:
                return redirect(url_for('login'))
            return f(*args, **kwargs)
        return decorated_function
    
    # Routes
    @app.route('/')
    def index():
        if 'admin_logged_in' in session:
            return redirect(url_for('dashboard'))
        return redirect(url_for('login'))
    
    @app.route('/admin/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            username = request.form.get('username')
            password = request.form.get('password')
            
            # Simple authentication (change these credentials in production)
            admin_username = os.getenv('ADMIN_USERNAME', 'admin')
            admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
            
            if username == admin_username and password == admin_password:
                session.permanent = True
                session['admin_logged_in'] = True
                session['admin_username'] = username
                return redirect(url_for('dashboard'))
            else:
                return render_template('login.html', error='Invalid credentials')
        
        return render_template('login.html')
    
    @app.route('/admin/logout')
    def logout():
        session.clear()
        return redirect(url_for('login'))
    
    @app.route('/admin/dashboard')
    @login_required
    def dashboard():
        stats = {
            'total_users': User.query.count(),
            'total_clients': User.query.filter_by(user_type='client').count(),
            'total_therapists': User.query.filter_by(user_type='therapist').count(),
            'total_messages': Message.query.count(),
            'total_bookings': SessionBooking.query.count(),
        }
        return render_template('dashboard.html', stats=stats)
    
    @app.route('/admin/api/users')
    @login_required
    def get_users():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        user_type = request.args.get('user_type', None)
        
        query = User.query
        if user_type:
            query = query.filter_by(user_type=user_type)
        
        pagination = query.paginate(page=page, per_page=per_page)
        
        return jsonify({
            'users': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
    
    @app.route('/admin/api/users/clients')
    @login_required
    def get_clients():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = User.query.filter_by(user_type='client').paginate(page=page, per_page=per_page)
        
        return jsonify({
            'clients': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
    
    @app.route('/admin/api/users/therapists')
    @login_required
    def get_therapists():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        pagination = User.query.filter_by(user_type='therapist').paginate(page=page, per_page=per_page)
        
        return jsonify({
            'therapists': [user.to_dict() for user in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
    
    @app.route('/admin/api/users/<int:user_id>', methods=['GET', 'DELETE'])
    @login_required
    def manage_user(user_id):
        user = User.query.get_or_404(user_id)
        
        if request.method == 'DELETE':
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'User deleted successfully'})
        
        return jsonify(user.to_dict())
    
    @app.route('/admin/api/messages')
    @login_required
    def get_messages():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        room_id = request.args.get('room_id', None)
        
        query = Message.query
        if room_id:
            query = query.filter_by(room_id=room_id)
        
        pagination = query.order_by(Message.timestamp.desc()).paginate(page=page, per_page=per_page)
        
        return jsonify({
            'messages': [msg.to_dict() for msg in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
    
    @app.route('/admin/api/bookings')
    @login_required
    def get_bookings():
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status = request.args.get('status', None)
        
        query = SessionBooking.query
        if status:
            query = query.filter_by(status=status)
        
        pagination = query.order_by(SessionBooking.scheduled_time.desc()).paginate(page=page, per_page=per_page)
        
        return jsonify({
            'bookings': [booking.to_dict() for booking in pagination.items],
            'total': pagination.total,
            'pages': pagination.pages,
            'current_page': page
        })
    
    @app.route('/admin/api/users/clients', methods=['GET'])
    @login_required
    def clients_view():
        return render_template('users.html', user_type='client')
    
    @app.route('/admin/api/users/therapists', methods=['GET'])
    @login_required
    def therapists_view():
        return render_template('users.html', user_type='therapist')
    
    return app

if __name__ == '__main__':
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    app.run(host='0.0.0.0', port=5000, debug=True)
