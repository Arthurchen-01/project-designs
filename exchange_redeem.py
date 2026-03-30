from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
import time
import os
import base64
from PIL import Image
import pytesseract
import io

# 设置Chrome选项
chrome_options = Options()
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
chrome_options.add_experimental_option('useAutomationExtension', False)

# 兑换码列表
redeem_codes = [
    "VVoKGAhZJ3Xvpre2ySsh8A",
    "zDMmkb4heSB0bPA2QUOX4g", 
    "b6BSXbK547F78l1joDm4mA",
    "iXeYw4xMvh8S7dOF52XwA",
    "N4E5gZnboP0hqsJEYxR2cw"
]

# 手机号
phone_number = "15889683687"

# 兑换链接
exchange_url = "https://shk.virtual.007ka.cn/exchange/card_bank?sign=102eb4c94e6fd8e2a315e48cac306f845"

def ocr_captcha(driver, captcha_element):
    """使用OCR识别验证码"""
    try:
        # 获取验证码图片
        captcha_screenshot = captcha_element.screenshot_as_png
        
        # 使用PIL打开图片
        image = Image.open(io.BytesIO(captcha_screenshot))
        
        # 预处理图片（提高识别率）
        image = image.convert('L')  # 转换为灰度图
        
        # 使用pytesseract进行OCR识别
        captcha_text = pytesseract.image_to_string(image, config='--psm 8 --oem 3 -c tessedit_char_whitelist=0123456789')
        
        # 清理识别结果
        captcha_text = captcha_text.strip().replace(' ', '')
        
        print(f"OCR识别到的验证码: {captcha_text}")
        return captcha_text
        
    except Exception as e:
        print(f"OCR识别失败: {e}")
        return None

try:
    # 初始化浏览器
    driver = webdriver.Chrome(options=chrome_options)
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    print("正在打开兑换页面...")
    driver.get(exchange_url)
    
    # 等待页面加载
    time.sleep(5)
    
    # 遍历每个兑换码
    for i, code in enumerate(redeem_codes, 1):
        print(f"\n开始兑换第{i}个兑换码: {code}")
        
        try:
            # 等待输入框出现
            wait = WebDriverWait(driver, 10)
            
            # 查找兑换码输入框
            code_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='请输入兑换码']")))
            code_input.clear()
            code_input.send_keys(code)
            print(f"已输入兑换码: {code}")
            
            # 查找手机号输入框
            phone_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='请输入手机号']")))
            phone_input.clear()
            phone_input.send_keys(phone_number)
            print(f"已输入手机号: {phone_number}")
            
            # 查找验证码输入框
            verify_input = wait.until(EC.presence_of_element_located((By.XPATH, "//input[@placeholder='请输入验证码']")))
            
            # 获取验证码按钮
            verify_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), '获取验证码')]")))
            verify_button.click()
            print("已点击获取验证码")
            
            # 等待验证码图片出现
            time.sleep(2)
            
            # 尝试查找验证码图片
            try:
                captcha_img = driver.find_element(By.XPATH, "//img[contains(@src, 'captcha') or contains(@src, 'verify')]")
                captcha_text = ocr_captcha(driver, captcha_img)
                
                if captcha_text and len(captcha_text) == 4:  # 假设验证码是4位数字
                    verify_input.clear()
                    verify_input.send_keys(captcha_text)
                    print(f"已输入验证码: {captcha_text}")
                else:
                    print("OCR识别失败，请手动输入验证码")
                    time.sleep(30)  # 等待手动输入
                    
            except:
                print("未找到验证码图片，请手动输入验证码")
                time.sleep(30)  # 等待手动输入
            
            # 查找提交按钮
            submit_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), '立即兑换')]")))
            submit_button.click()
            print("已点击立即兑换")
            
            # 等待结果
            time.sleep(3)
            
            # 检查是否成功
            try:
                success_message = driver.find_element(By.XPATH, "//*[contains(text(), '兑换成功')]")
                print(f"✅ 兑换成功: {code}")
            except:
                print(f"❌ 兑换可能失败，请检查页面状态")
            
            # 刷新页面准备下一个兑换
            driver.refresh()
            time.sleep(3)
            
        except Exception as e:
            print(f"兑换过程中出现错误: {e}")
            driver.refresh()
            time.sleep(3)
    
    print("\n所有兑换码处理完成！")
    print("\n请按照以下流程使用优惠券:")
    print("1. 进入【蜜雪冰城】小程序")
    print("2. 点击【我的】")
    print("3. 点击【优惠券】")
    print("4. 直接使用优惠券")
    
except Exception as e:
    print(f"程序运行出错: {e}")
    
finally:
    # 保持浏览器打开以便查看结果
    input("\n按Enter键关闭浏览器...")
    driver.quit()