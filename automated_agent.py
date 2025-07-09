import os
import logging
import time
from datetime import datetime
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from youtube_logic import get_latest_videos
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AutomatedAgent:
    """
    Automated agent to keep the website updated with fresh content,
    fix YouTube API issues, and ensure CTA buttons display correctly.
    """
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.is_running = False
        self.last_update = None
        self.update_log = []
        
    def start(self):
        """Start the automated agent with scheduled tasks."""
        if not self.is_running:
            # Schedule YouTube video updates every hour
            self.scheduler.add_job(
                func=self.update_youtube_content,
                trigger=IntervalTrigger(hours=1),
                id='youtube_update',
                name='Update YouTube Content',
                replace_existing=True
            )
            
            # Schedule CTA button validation every 6 hours
            self.scheduler.add_job(
                func=self.validate_cta_buttons,
                trigger=IntervalTrigger(hours=6),
                id='cta_validation',
                name='Validate CTA Buttons',
                replace_existing=True
            )
            
            # Schedule general health check every 30 minutes
            self.scheduler.add_job(
                func=self.health_check,
                trigger=IntervalTrigger(minutes=30),
                id='health_check',
                name='System Health Check',
                replace_existing=True
            )
            
            self.scheduler.start()
            self.is_running = True
            logger.info("Automated agent started successfully")
            
    def stop(self):
        """Stop the automated agent."""
        if self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Automated agent stopped")
            
    def update_youtube_content(self):
        """Update YouTube video content with enhanced error handling."""
        try:
            logger.info("Starting YouTube content update...")
            
            # Default channel ID for TheBadGuyHimself
            channel_id = os.getenv('YOUTUBE_CHANNEL_ID', 'UC_x5XG1OV2P6uZZ5FSM9Ttw')
            
            # Attempt to fetch latest videos with retry logic
            max_retries = 3
            retry_delay = 5  # seconds
            
            for attempt in range(max_retries):
                try:
                    videos_data = get_latest_videos(channel_id, max_results=10)
                    
                    # Store the updated data
                    self._store_youtube_data(videos_data)
                    
                    logger.info(f"Successfully updated YouTube content: {len(videos_data.get('videos', []))} videos fetched")
                    self._log_update("youtube_update", "success", f"Fetched {len(videos_data.get('videos', []))} videos")
                    break
                    
                except Exception as e:
                    logger.warning(f"YouTube update attempt {attempt + 1} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay * (attempt + 1))  # Exponential backoff
                    else:
                        raise e
                        
        except Exception as e:
            error_msg = f"Failed to update YouTube content after {max_retries} attempts: {str(e)}"
            logger.error(error_msg)
            self._log_update("youtube_update", "error", error_msg)
            
    def validate_cta_buttons(self):
        """Validate and fix CTA button configurations."""
        try:
            logger.info("Starting CTA button validation...")
            
            # Define expected CTA button configurations
            expected_ctas = {
                'index.html': [
                    {'text': '🎧 Listen to Mixes', 'href': 'music.html'},
                    {'text': '📸 View Gallery', 'href': 'gallery.html'},
                    {'text': '📩 Book Now', 'href': 'bookings.html'}
                ],
                'gallery.html': [
                    {'text': 'Home', 'href': 'index.html'},
                    {'text': 'Music', 'href': 'music.html'},
                    {'text': 'Bookings', 'href': 'bookings.html'}
                ]
            }
            
            validation_results = []
            
            for page, expected_buttons in expected_ctas.items():
                try:
                    if os.path.exists(page):
                        with open(page, 'r', encoding='utf-8') as f:
                            content = f.read()
                            
                        # Simple validation - check if expected text and href exist
                        for button in expected_buttons:
                            if button['text'] in content and button['href'] in content:
                                validation_results.append(f"✓ {page}: {button['text']} - OK")
                            else:
                                validation_results.append(f"✗ {page}: {button['text']} - MISSING OR INCORRECT")
                                
                except Exception as e:
                    validation_results.append(f"✗ {page}: Error reading file - {str(e)}")
                    
            logger.info("CTA validation completed")
            self._log_update("cta_validation", "success", "; ".join(validation_results))
            
        except Exception as e:
            error_msg = f"CTA validation failed: {str(e)}"
            logger.error(error_msg)
            self._log_update("cta_validation", "error", error_msg)
            
    def health_check(self):
        """Perform general system health checks."""
        try:
            logger.info("Performing system health check...")
            
            health_status = {
                'timestamp': datetime.now().isoformat(),
                'agent_running': self.is_running,
                'last_update': self.last_update,
                'scheduler_jobs': len(self.scheduler.get_jobs()) if self.is_running else 0
            }
            
            # Check if required environment variables are set
            required_env_vars = ['YOUTUBE_API_KEY']
            missing_vars = [var for var in required_env_vars if not os.getenv(var)]
            
            if missing_vars:
                health_status['warnings'] = f"Missing environment variables: {', '.join(missing_vars)}"
                logger.warning(f"Health check warning: Missing environment variables: {', '.join(missing_vars)}")
            else:
                health_status['status'] = 'healthy'
                
            self._log_update("health_check", "success", json.dumps(health_status))
            logger.info("Health check completed successfully")
            
        except Exception as e:
            error_msg = f"Health check failed: {str(e)}"
            logger.error(error_msg)
            self._log_update("health_check", "error", error_msg)
            
    def manual_trigger(self, task_type="all"):
        """Manually trigger specific tasks or all tasks."""
        try:
            logger.info(f"Manual trigger requested for: {task_type}")
            
            if task_type in ["all", "youtube"]:
                self.update_youtube_content()
                
            if task_type in ["all", "cta"]:
                self.validate_cta_buttons()
                
            if task_type in ["all", "health"]:
                self.health_check()
                
            return {"status": "success", "message": f"Manual trigger completed for: {task_type}"}
            
        except Exception as e:
            error_msg = f"Manual trigger failed: {str(e)}"
            logger.error(error_msg)
            return {"status": "error", "message": error_msg}
            
    def get_status(self):
        """Get current agent status and recent logs."""
        return {
            'is_running': self.is_running,
            'last_update': self.last_update,
            'recent_logs': self.update_log[-10:],  # Last 10 log entries
            'scheduled_jobs': [job.id for job in self.scheduler.get_jobs()] if self.is_running else []
        }
        
    def _store_youtube_data(self, data):
        """Store YouTube data for frontend consumption."""
        try:
            os.makedirs('data', exist_ok=True)
            with open('data/youtube_cache.json', 'w') as f:
                json.dump(data, f, indent=2)
        except Exception as e:
            logger.warning(f"Failed to store YouTube data: {str(e)}")
            
    def _log_update(self, task_type, status, message):
        """Log update activities."""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'task_type': task_type,
            'status': status,
            'message': message
        }
        
        self.update_log.append(log_entry)
        self.last_update = log_entry['timestamp']
        
        # Keep only last 50 log entries
        if len(self.update_log) > 50:
            self.update_log = self.update_log[-50:]

# Global agent instance
agent = AutomatedAgent()

def start_agent():
    """Start the automated agent."""
    agent.start()
    
def stop_agent():
    """Stop the automated agent."""
    agent.stop()
    
def trigger_manual_update(task_type="all"):
    """Trigger manual update."""
    return agent.manual_trigger(task_type)
    
def get_agent_status():
    """Get agent status."""
    return agent.get_status()
