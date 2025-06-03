import csv
import random
import json


def get_student_usernames(json_file):
    """
    Extract usernames of students from the JSON file.
    """
    with open(json_file, 'r') as file:
        data = json.load(file)
        # Filter only students (role = 3)
        return [entry['fields']['username'] for entry in data if entry['model'] == 'pramlearnapp.customuser' and entry['fields']['role'] == 3]


def generate_arcs_data(filename, usernames):
    """
    Generate ARCS data for students based on their usernames.
    """
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        # Header
        header = ['username'] + \
            [f'dim_{dim}_q{q}' for dim in ['A', 'R', 'C', 'S']
                for q in range(1, 6)]
        writer.writerow(header)

        # Generate random data
        for username in usernames:
            # Random scores between 1 and 5
            row = [username] + [random.randint(1, 5) for _ in range(20)]
            writer.writerow(row)


# Load usernames from initial_data.json
usernames = get_student_usernames('pramlearnapp/fixtures/initial_data.json')

# Generate the CSV file
generate_arcs_data('pramlearnapp/fixtures/arcs_data.csv', usernames)
