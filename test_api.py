#!/usr/bin/env python3
"""
Test script for the Facial Emotion Detection API
"""

import requests
import base64
import json
import os

API_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{API_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_file_upload():
    """Test file upload analysis"""
    print("\n📁 Testing file upload...")
    
    # Create a simple test image (you can replace this with an actual image file)
    test_image_path = "test_image.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"⚠️  Test image '{test_image_path}' not found. Please add a test image.")
        return False
    
    try:
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{API_URL}/analyze", files=files)
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ File upload test failed: {e}")
        return False

def test_base64_upload():
    """Test base64 image analysis"""
    print("\n🔤 Testing base64 upload...")
    
    test_image_path = "test_image.jpg"
    
    if not os.path.exists(test_image_path):
        print(f"⚠️  Test image '{test_image_path}' not found. Please add a test image.")
        return False
    
    try:
        # Convert image to base64
        with open(test_image_path, 'rb') as f:
            image_data = base64.b64encode(f.read()).decode('utf-8')
        
        payload = {"image_data": image_data}
        headers = {'Content-Type': 'application/json'}
        
        response = requests.post(f"{API_URL}/analyze", 
                               data=json.dumps(payload), 
                               headers=headers)
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Base64 upload test failed: {e}")
        return False

def test_batch_analysis():
    """Test batch analysis"""
    print("\n📦 Testing batch analysis...")
    
    test_images = ["test_image.jpg"]  # Add more test images if available
    existing_images = [img for img in test_images if os.path.exists(img)]
    
    if not existing_images:
        print("⚠️  No test images found for batch analysis.")
        return False
    
    try:
        files = []
        for img_path in existing_images:
            files.append(('images', open(img_path, 'rb')))
        
        response = requests.post(f"{API_URL}/batch_analyze", files=files)
        
        # Close file handles
        for _, file_handle in files:
            file_handle.close()
        
        print(f"Status: {response.status_code}")
        result = response.json()
        print(f"Response: {json.dumps(result, indent=2)}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"❌ Batch analysis test failed: {e}")
        return False

def test_error_cases():
    """Test error handling"""
    print("\n🚨 Testing error cases...")
    
    # Test empty request
    try:
        response = requests.post(f"{API_URL}/analyze", json={})
        print(f"Empty request - Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Empty request test failed: {e}")
    
    # Test invalid base64
    try:
        payload = {"image_data": "invalid_base64_data"}
        response = requests.post(f"{API_URL}/analyze", json=payload)
        print(f"Invalid base64 - Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Invalid base64 test failed: {e}")

def main():
    """Run all tests"""
    print("🧪 Starting API Tests...")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health_check),
        ("File Upload", test_file_upload),
        ("Base64 Upload", test_base64_upload),
        ("Batch Analysis", test_batch_analysis),
        ("Error Cases", test_error_cases)
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"  {test_name}: {status}")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    print(f"\n🎯 Overall: {passed_count}/{total_count} tests passed")

if __name__ == "__main__":
    main()