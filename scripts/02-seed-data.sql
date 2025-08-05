-- This script should only be run AFTER you have created an admin user
-- through the signup process in the application.

-- First, let's check if we have any admin users
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Try to find an admin user
    SELECT id INTO admin_user_id 
    FROM profiles 
    WHERE is_admin = true 
    LIMIT 1;
    
    -- If no admin user exists, create a placeholder message
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin users found. Please create an admin user through the application first, then run this script again.';
        RAISE NOTICE 'Go to /admin/login, sign up, and enter your admin invite code.';
    ELSE
        -- Insert sample events using the admin user ID
        INSERT INTO events (
          title,
          date,
          start_time,
          format,
          location,
          short_description,
          description,
          signup_link,
          created_by
        ) VALUES 
        (
          'Introduction to Robotics',
          CURRENT_DATE + INTERVAL '7 days',
          '14:00:00',
          'in_person',
          'Community Center Room 101',
          'Learn the basics of robotics and build your first robot! Perfect for beginners aged 8-14.',
          '# Introduction to Robotics Workshop

Join us for an exciting hands-on workshop where students will:

- Learn basic robotics concepts
- Build a simple robot using LEGO Mindstorms
- Program their robot to complete challenges
- Take home their creation!

**What to bring:**
- Notebook and pencil
- Enthusiasm for learning!

**Prerequisites:** None - this is perfect for beginners!',
          'https://forms.google.com/robotics-workshop-example',
          admin_user_id
        ),
        (
          'Coding with Scratch',
          CURRENT_DATE + INTERVAL '14 days',
          '10:00:00',
          'virtual',
          NULL,
          'Create your first video game using Scratch! No prior coding experience needed.',
          '# Coding with Scratch

Discover the world of programming through Scratch, a visual programming language designed for kids!

**What you''ll learn:**
- Basic programming concepts
- How to create animations
- Game development fundamentals
- Problem-solving skills

**Requirements:**
- Computer with internet access
- Zoom for the virtual session

Join us online for this fun and interactive session!',
          'https://calendly.com/scratch-coding-example',
          admin_user_id
        ),
        (
          '3D Printing Workshop',
          CURRENT_DATE + INTERVAL '21 days',
          '13:00:00',
          'hybrid',
          'Maker Space Lab',
          'Design and print your own 3D creations! Learn the basics of 3D modeling and printing.',
          '# 3D Printing Workshop

Step into the future of manufacturing! In this workshop, you''ll:

- Learn 3D design principles
- Use Tinkercad to create your models
- Understand how 3D printers work
- Print your own custom creation

**Age Range:** 10-16 years old
**Duration:** 3 hours
**Take Home:** Your 3D printed creation!',
          'https://eventbrite.com/3d-printing-workshop-example',
          admin_user_id
        );
        
        RAISE NOTICE 'Sample events created successfully!';
    END IF;
END $$;
