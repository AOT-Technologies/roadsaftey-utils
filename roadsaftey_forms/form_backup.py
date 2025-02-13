import tkinter as tk
from tkinter import ttk, scrolledtext
import psycopg2
import requests
import json
import os
from datetime import datetime
import threading
from queue import Queue

class FormsExportGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Forms Export Tool")
        self.root.geometry("1200x800")
        
        # Create main frame
        main_frame = ttk.Frame(root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Database Configuration Section
        db_frame = ttk.LabelFrame(main_frame, text="Database Configuration", padding="5")
        db_frame.pack(fill=tk.X, pady=5)
        
        # Database connection variables
        self.host = tk.StringVar(value="localhost")
        self.port = tk.StringVar(value="5432")
        self.dbname = tk.StringVar(value="formsflow_api")
        self.table = tk.StringVar(value="form_process_mapper")
        self.username = tk.StringVar(value="formsflowdbuser")
        self.password = tk.StringVar(value="blM_#W8384q0")
        
        
        # Create database config grid
        labels = ["Host:", "Port:", "Database:", "Table:", "Username:", "Password:"]
        variables = [self.host, self.port, self.dbname, self.table, self.username, self.password]
        
        for i, (label, var) in enumerate(zip(labels, variables)):
            ttk.Label(db_frame, text=label).grid(row=i//3, column=(i%3)*2, padx=5, pady=2)
            if label == "Password:":
                entry = ttk.Entry(db_frame, textvariable=var, show="*")
            else:
                entry = ttk.Entry(db_frame, textvariable=var)
            entry.grid(row=i//3, column=(i%3)*2+1, padx=5, pady=2)
        
        # API Configuration Section
        api_frame = ttk.LabelFrame(main_frame, text="API Configuration", padding="5")
        api_frame.pack(fill=tk.X, pady=5)
        
        self.api_base_url = tk.StringVar(
            value="https://forms-flow-web-be78d6-dev.apps.silver.devops.gov.bc.ca/webapi/form"
        )
        self.bearer_token = tk.StringVar()
        
        ttk.Label(api_frame, text="API Base URL:").pack(side=tk.LEFT, padx=5)
        ttk.Entry(api_frame, textvariable=self.api_base_url, width=70).pack(side=tk.LEFT, padx=5)
        
        ttk.Label(api_frame, text="Bearer Token:").pack(side=tk.LEFT, padx=5)
        ttk.Entry(api_frame, textvariable=self.bearer_token, show="*", width=40).pack(side=tk.LEFT, padx=5)
        
        # Process Keys Section
        process_frame = ttk.LabelFrame(main_frame, text="Process Keys (one per line)", padding="5")
        process_frame.pack(fill=tk.X, pady=5)
        
        # Default process keys
        self.default_process_keys = [
            "childDriversInformation",
            "childVehicleInformation", 
            "childRegisteredOwnerInfo",
            "childVehicleImpoundOrDisposition",
            "childDispositionOfVehicle",
            "childVehicleImpoundmentIRP",
            "childVehicleImpoudmentReason",
            "childExcessiveSpeed",
            "childUnlicensedDriver",
            "childLinkageFactors",
            "childReasonableGrounds",
            "childTestAdministered",
            "childProhibitionForm",
            "childIncidentDetails",
            "rsRoadSafteyMainFormPath"
        ]
        
        self.process_keys_text = scrolledtext.ScrolledText(process_frame, height=10)
        self.process_keys_text.pack(fill=tk.X, padx=5, pady=5)
        
        # Pre-populate with default process keys
        self.process_keys_text.insert(tk.END, "\n".join(self.default_process_keys))
        
        # Add Reset button for process keys
        ttk.Button(process_frame, text="Reset to Default Keys", 
                  command=self.reset_process_keys).pack(side=tk.LEFT, padx=5)

        
        # Control Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=5)
        
        ttk.Button(button_frame, text="Test Connection", command=self.test_connection).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Export Forms", command=self.export_forms).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear Output", command=self.clear_output).pack(side=tk.LEFT, padx=5)
        
        # Output Display
        output_frame = ttk.LabelFrame(main_frame, text="Output Log", padding="5")
        output_frame.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.output = scrolledtext.ScrolledText(output_frame, wrap=tk.WORD)
        self.output.pack(fill=tk.BOTH, expand=True, padx=5, pady=5)
        
        # Queue for thread-safe logging
        self.queue = Queue()
        self.root.after(100, self.process_queue)

    def log_message(self, message):
        """Add message to queue for thread-safe logging"""
        self.queue.put(message)

    def process_queue(self):
        """Process messages from queue and update output"""
        while not self.queue.empty():
            message = self.queue.get()
            self.output.insert(tk.END, message + "\n")
            self.output.see(tk.END)
        self.root.after(100, self.process_queue)

    def clear_output(self):
        """Clear output display"""
        self.output.delete(1.0, tk.END)
        
    def reset_process_keys(self):
        """Reset process keys to default values"""
        self.process_keys_text.delete(1.0, tk.END)
        self.process_keys_text.insert(tk.END, "\n".join(self.default_process_keys))

    def test_connection(self):
        """Test database connection"""
        try:
            conn = psycopg2.connect(
                host=self.host.get(),
                port=self.port.get(),
                dbname=self.dbname.get(),
                user=self.username.get(),
                password=self.password.get()
            )
            conn.close()
            self.log_message("Database connection successful!")
        except Exception as e:
            self.log_message(f"Database connection failed: {str(e)}")

    def export_forms(self):
        """Export forms based on process keys"""
        def worker():
            try:
                # Get process keys from text area
                process_keys = [
                    key.strip() 
                    for key in self.process_keys_text.get(1.0, tk.END).split('\n') 
                    if key.strip()
                ]
                
                if not process_keys:
                    self.log_message("Please enter at least one process key")
                    return
                
                # Create output directory with formatted timestamp
                timestamp = datetime.now().strftime("%d_%b_%Y_%I_%M_%p").lower()
                output_dir = os.path.join("exported_forms", timestamp)
                os.makedirs(output_dir, exist_ok=True)
                
                # Connect to database
                conn = psycopg2.connect(
                    host=self.host.get(),
                    port=self.port.get(),
                    dbname=self.dbname.get(),
                    user=self.username.get(),
                    password=self.password.get()
                )
                cur = conn.cursor()
                
                # Get forms for each process key
                for process_key in process_keys:
                    self.log_message(f"\nProcessing forms for process_key: {process_key}")
                    
                    # Query to get form IDs
                    query = f"""
                        SELECT id, form_id 
                        FROM {self.table.get()} 
                        WHERE process_key = %s
                    """
                    cur.execute(query, (process_key,))
                    forms = cur.fetchall()
                    
                    if not forms:
                        self.log_message(f"No forms found for process_key: {process_key}")
                        continue
                    
                    # Export each form
                    for form_id, form_uuid in forms:
                        try:
                            url = f"{self.api_base_url.get()}/{form_id}/export"
                            headers = {"Authorization": f"Bearer {self.bearer_token.get()}"}
                            
                            response = requests.get(url, headers=headers)
                            response.raise_for_status()
                            
                            # Save response to file with process_key as filename
                            filename = os.path.join(output_dir, f"{process_key}.json")
                            with open(filename, 'w') as f:
                                json.dump(response.json(), f, indent=2)
                            
                            self.log_message(f"Exported form {form_id} to {filename}")
                            
                        except Exception as e:
                            self.log_message(f"Error exporting form {form_id}: {str(e)}")
                
                conn.close()
                self.log_message("\nExport completed!")
                
            except Exception as e:
                self.log_message(f"Export failed: {str(e)}")

        # Run export in separate thread
        thread = threading.Thread(target=worker)
        thread.daemon = True
        thread.start()

def main():
    root = tk.Tk()
    app = FormsExportGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()