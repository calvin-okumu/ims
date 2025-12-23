"""
Inspect pyzkfp library to understand its API
"""

print("🔍 Inspecting pyzkfp library...")

try:
    import pyzkfp
    print("✅ pyzkfp imported successfully")
    print(f"pyzkfp version: {getattr(pyzkfp, '__version__', 'unknown')}")
    print(f"pyzkfp attributes: {dir(pyzkfp)}")

    # Try to see what's available
    for attr in dir(pyzkfp):
        if not attr.startswith('_'):
            obj = getattr(pyzkfp, attr)
            print(f"  {attr}: {type(obj)} - {obj}")

except Exception as e:
    print(f"❌ Error inspecting pyzkfp: {e}")

print("\n🔍 Inspecting pyzk library...")

try:
    from zk import ZK
    print("✅ pyzk imported successfully")
    print(f"ZK class: {ZK}")
    print(f"ZK methods: {[m for m in dir(ZK) if not m.startswith('_')]}")

except Exception as e:
    print(f"❌ Error inspecting pyzk: {e}")