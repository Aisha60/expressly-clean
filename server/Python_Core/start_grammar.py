import subprocess
import os
import glob

print("Starting LanguageTool Server...")

# Change to the LanguageTool-6.6 directory where the JARs are
lt_dir = "language_tool/LanguageTool-6.6"
os.chdir(lt_dir)

# Get all JAR files
jar_files = glob.glob("*.jar")
print(f"Found JARs: {jar_files}")

# Use all JAR files in classpath
classpath = ";".join(jar_files)

# Start the server
subprocess.run([
    'java', 
    '-cp', classpath, 
    'org.languagetool.server.HTTPServer', 
    '--port', '8081', 
    '--public'
])