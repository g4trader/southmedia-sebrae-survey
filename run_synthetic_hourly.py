#!/usr/bin/env python3
"""
Script para execução horária via Cron/Scheduler
Gera 2-3 sessões sintéticas por execução
"""

import sys
import random
from datetime import datetime
from generate_synthetic_responses import generate_batch, DRY_RUN

def main():
    # Definir quantas sessões gerar nesta execução (2-3 para média de 50 sessões)
    count = random.randint(2, 3)
    
    print(f"⏰ Execução horária - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎲 Gerando {count} sessões sintéticas...")
    
    try:
        sessions = generate_batch(count)
        successful = sum(1 for s in sessions if s["success"])
        
        if successful == count:
            print(f"✅ Sucesso: {successful}/{count} sessões criadas")
            sys.exit(0)
        else:
            print(f"⚠️  Parcial: {successful}/{count} sessões criadas")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        sys.exit(2)

if __name__ == "__main__":
    main()

