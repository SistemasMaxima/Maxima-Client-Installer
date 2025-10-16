import sys
import json
import csv
import re

def main():
    # 1. Check if a file path was provided as a command-line argument.
    if len(sys.argv) < 2:
        # If not, print an error as a JSON object and exit.
        error_data = {"status": "error", "message": "No file path provided to the script."}
        print(json.dumps(error_data))
        sys.exit(1)

    # 2. The file path is the second argument.
    numArg = 0
    file_path = None
    for arg in sys.argv:
        #print("Arg: ", arg)
        if arg == "-f":
            file_path = sys.argv[numArg + 1]
        numArg += 1
    
    if file_path == None:
        error_data = {"status": "error", "message": f"File flag not given: {file_path}"}
        print(json.dumps(error_data))
        sys.exit(1)

    track_numbers = []
    
    # --- Your Logic to Read the File ---
    try:
        with open(file_path, "r", encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for line in reader:
                # Check for the required keys in the CSV header
                if 'OUTBOUND TRACKING' in line and 'PAQUETERIA' in line:
                    if "PAQUETE EXPRESS" in line['PAQUETERIA'] or "MTY" in line['OUTBOUND TRACKING']:
                        tracking_number = line['OUTBOUND TRACKING']
                        # Simplify regex and handle cases where it might not match
                        matches = re.findall("(MTY[a-zA-Z0-9]+)(001001)", tracking_number)
                        if matches:
                            track_numbers.append(matches[0][0])
    except FileNotFoundError:
        error_data = {"status": "error", "message": f"File not found at path: {file_path}"}
        print(json.dumps(error_data))
        sys.exit(1)
    except Exception as e:
        error_data = {"status": "error", "message": f"An error occurred while reading the file: {str(e)}"}
        print(json.dumps(error_data))
        sys.exit(1)

    # --- Your Logic to Build Links ---
    base_link = "https://www.paquetexpress.com.mx/rastreo/"
    final_data = {"totalTrackNumbers": 0, "totalLinks": 0, "links": []}
    
    processed_count = 0
    total_track_nums = len(track_numbers)

    while processed_count < total_track_nums:
        # Take a chunk of up to 30 tracking numbers
        chunk = track_numbers[processed_count : processed_count + 30]
        
        link_details = {
            "link": base_link + "-".join(chunk),
            "trackNumbersCount": len(chunk),
            "trackNumbers": chunk
        }
        
        final_data["links"].append(link_details)
        processed_count += len(chunk)

    final_data["totalTrackNumbers"] = total_track_nums
    final_data["totalLinks"] = len(final_data["links"])
    
    # 3. Print the final result as a single JSON string.
    # This is the ONLY print statement that should run on success.
    print(json.dumps(final_data))

if __name__ == "__main__":
    main()