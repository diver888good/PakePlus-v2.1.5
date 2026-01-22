#!/usr/bin/env python3
"""
Python桌面应用程序打包脚本
此脚本用于将Python源代码打包成可执行文件
"""

import os
import sys
import subprocess
from pathlib import Path

def install_dependencies():
    """安装依赖包"""
    print("正在安装依赖包...")
    
    # 尝试使用多种方式安装依赖
    commands = [
        ["pip", "install", "--break-system-packages", "PyQt6", "requests", "qrcode", "pillow", "python-dotenv"],
        ["pip", "install", "PyQt6", "requests", "qrcode", "pillow", "python-dotenv"],
        ["pip3", "install", "PyQt6", "requests", "qrcode", "pillow", "python-dotenv"]
    ]
    
    for cmd in commands:
        try:
            result = subprocess.run(cmd, check=True, capture_output=True, text=True)
            print(f"成功执行: {' '.join(cmd)}")
            return True
        except subprocess.CalledProcessError as e:
            print(f"命令失败: {' '.join(cmd)}, 错误: {e}")
            continue
    
    print("无法安装依赖包，请手动安装:")
    print("sudo apt-get install python3-pyqt6 python3-requests python3-qrcode python3-pil python3-dotenv")
    return False

def create_spec_file():
    """创建PyInstaller spec文件"""
    spec_content = '''# -*- mode: python ; coding: utf-8 -*-

block_cipher = None

a = Analysis(
    ['main_app.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('config.py', '.'),
        ('db_operate.py', '.'),
        ('ai_chat_core.py', '.'),
        ('ai_float_window.py', '.')
    ],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='GiftExchangePlatform',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
'''
    
    with open('GiftExchangePlatform.spec', 'w', encoding='utf-8') as f:
        f.write(spec_content)
    
    print("已创建spec文件: GiftExchangePlatform.spec")

def build_executable():
    """构建可执行文件"""
    print("正在构建可执行文件...")
    
    # 检查是否安装了pyinstaller
    try:
        subprocess.run(['pip', 'show', 'pyinstaller'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("正在安装pyinstaller...")
        try:
            subprocess.run(['pip', 'install', '--break-system-packages', 'pyinstaller'], check=True)
        except subprocess.CalledProcessError:
            try:
                subprocess.run(['pip', 'install', 'pyinstaller'], check=True)
            except subprocess.CalledProcessError:
                print("无法安装pyinstaller，请手动安装: pip install pyinstaller")
                return False
    
    # 创建spec文件
    create_spec_file()
    
    # 运行pyinstaller
    try:
        subprocess.run(['pyinstaller', '-F', '-w', 'GiftExchangePlatform.spec'], check=True)
        print("构建成功！可执行文件位于dist目录下")
        return True
    except subprocess.CalledProcessError as e:
        print(f"构建失败: {e}")
        return False

def main():
    """主函数"""
    print("开始构建礼品交换平台桌面应用程序...")
    
    # 切换到项目目录
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    print(f"切换到项目目录: {project_dir}")
    
    # 安装依赖
    if not install_dependencies():
        print("依赖安装失败，但将继续尝试构建...")
    
    # 构建可执行文件
    if build_executable():
        print("\\n构建完成！")
        print("可以在dist/目录下找到生成的可执行文件")
    else:
        print("\\n构建失败，请检查错误信息并重试")
        
        # 提供替代方案
        print("\\n如果构建失败，可以尝试以下方法：")
        print("1. 手动安装依赖: sudo apt-get install python3-pyqt6 python3-requests python3-qrcode python3-pil python3-dotenv")
        print("2. 或者直接运行Python程序: python3 main_app.py")

if __name__ == '__main__':
    main()