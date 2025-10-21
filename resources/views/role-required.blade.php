<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Role Assignment Required</title>
    <style>
        body {
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 2rem;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        h1 {
            color: #1e40af;
            margin-top: 0;
        }
        .status {
            padding: 1rem;
            background-color: #f0f9ff;
            border-left: 4px solid #3b82f6;
            margin: 1rem 0;
        }
        .details {
            margin-top: 2rem;
        }
        .label {
            font-weight: 600;
            color: #4b5563;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Role Assignment Required</h1>
        <p>Your account has been created successfully, but a role has not been assigned yet.</p>
        
        <div class="status">
            Please contact your system administrator to assign you an appropriate role (Admin, Doctor, Nurse, Patient, or Receptionist).
        </div>

        <div class="details">
            <p><span class="label">Account Details:</span></p>
            <p>Email: {{ $email }}</p>
            <p>Status: {{ $status }}</p>
        </div>
    </div>
</body>
</html>