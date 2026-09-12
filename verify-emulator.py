import importlib.util, json, sys
from pathlib import Path
spec = importlib.util.spec_from_file_location('bridge', Path(__file__).with_name('emu-call.py'))
bridge = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bridge)

def call(name, args=None):
    result = bridge.call(name, args)
    texts = [c['text'] for c in result.get('content', []) if c['type']=='text']
    text = '\n'.join(texts)
    try: value = json.loads(text)
    except ValueError: value = text
    with open('emulator-results.jsonl', 'a', encoding='utf8') as log:
        log.write(json.dumps({'tool': name, 'args': args, 'result': value}, ensure_ascii=True)+'\n')
    return value

def load():
    call('debug_break')
    data=Path('fig-forth.bin').read_bytes()
    for offset in range(0,len(data),4096):
        call('mem_write', {'addr':256+offset,'data':data[offset:offset+4096].hex()})
    call('regs_set',{'pc':256})
    call('emu_run_for',{'ms':1500})
    return call('text_screen')['text']

def type_line(line):
    call('emu_run')
    call('kbd_text',{'text':line+'\n'})
    call('emu_run_for',{'ms':600})
    return call('text_screen')['text']

if sys.argv[1]=='load':
    print(load())
elif sys.argv[1]=='type':
    print(type_line(sys.argv[2]))
elif sys.argv[1]=='test':
    assert 'FIG-FORTH 1.1' in load()
    cases = [('1 2 + .','3 OK'), (': SQ DUP * ; 7 SQ .','49 OK'),
             (': SUM 0 10 0 DO I + LOOP ; SUM .','45 OK')]
    for command, expected in cases:
        assert expected in type_line(command).split(command)[-1]
        print('PASS:',command,expected)
    for command in ['0 BLOCK','0 LOAD','FLUSH','0 0 1 R/W', ': BAD 0 BLOCK 999 . ; BAD']:
        tail=type_line(command).split(command)[-1]
        assert 'NO DISK' in tail and '999 ' not in tail
        check='8 SQ . STATE @ . BLK @ . DISK-ERROR @ .'
        assert '64 0 0 1 OK' in type_line(check).split(check)[-1]
        print('PASS:',command,'and recovery')
    assert '-->' in type_line('BYE')
    print('PASS: BYE returns to Monitor')
    assert 'FIG-FORTH 1.1' in type_line('G104')
    assert '81 OK' in type_line('9 SQ .').split('9 SQ .')[-1]
    print('PASS: warm re-entry preserves SQ')
    call('emu_run')
else:
    print(call(sys.argv[1], json.loads(sys.argv[2]) if len(sys.argv)>2 else {}))
