// Test script for OpenTimelineIO TypeScript/JavaScript bindings
const fs = require('fs');
const path = require('path');

function assert_and_throw(condition, message) {
    console.assert(condition, message);
    if (!condition) {
        throw new Error(message);
    }
}


function test_rational_time_constructor(Module) {
    // Create a RationalTime object (default constructor)
    const rt1 = new Module.RationalTime();

    // Test default constructor
    console.log(`Default RationalTime - value: ${rt1.value()}, rate: ${rt1.rate()}`);
    assert_and_throw(rt1.value() === 0, 'Default value should be 0');
    assert_and_throw(rt1.rate() === 1.0, 'Default rate should be 1.0');
    
    // Test constructor with value
    const t_val = 30.2;
    const rt_with_value = new Module.RationalTime(t_val);
    console.log(`RationalTime(${t_val}) - value: ${rt_with_value.value()}, rate: ${rt_with_value.rate()}`);
    assert_and_throw(rt_with_value.value() === t_val, `Value should be ${t_val}`);
    assert_and_throw(rt_with_value.rate() === 1.0, 'Default rate should be 1.0');
    
    // Test constructor with negative value
    const neg_val = -30.2;
    const rt_neg = new Module.RationalTime(neg_val);
    console.log(`RationalTime(${neg_val}) - value: ${rt_neg.value()}, rate: ${rt_neg.rate()}`);
    assert_and_throw(rt_neg.value() === neg_val, `Value should be ${neg_val}`);
}

function test_rational_time_validity(Module) {
    // Test validity
    const invalid_rt = new Module.RationalTime(0, 0);
    console.log(`Invalid RationalTime(0, 0) - is_invalid: ${invalid_rt.is_invalid_time()}, is_valid: ${invalid_rt.is_valid_time()}`);
    assert_and_throw(invalid_rt.is_invalid_time() === true, 'Time with rate 0 should be invalid');
    assert_and_throw(invalid_rt.is_valid_time() === false, 'Time with rate 0 should not be valid');
    
    const valid_rt = new Module.RationalTime(24);
    console.log(`Valid RationalTime(24) - is_invalid: ${valid_rt.is_invalid_time()}, is_valid: ${valid_rt.is_valid_time()}`);
    assert_and_throw(valid_rt.is_valid_time() === true, 'Time with positive rate should be valid');
    assert_and_throw(valid_rt.is_invalid_time() === false, 'Time with positive rate should not be invalid');
}

function test_rational_time_equality(Module) {
    // Test equality
    const eq1 = new Module.RationalTime(30.2);
    const eq2 = new Module.RationalTime(30.2);
    console.log(`Equality test - eq1: ${eq1.value()}, eq2: ${eq2.value()}`);
    assert_and_throw(eq1.equals(eq2) === true, 'Equal RationalTime objects should be equal');
    assert_and_throw(eq1.equals(eq1) === true, 'Object should equal itself');
    const eq3 = new Module.RationalTime(60.4, 2.0);
    console.log(`Equality with different rates - eq1: ${eq1.value()}, eq3: ${eq3.value()}, rate: ${eq3.rate()}`);
    assert_and_throw(eq1.equals(eq3) === true, 'RationalTime objects with equivalent values should be equal');    
}

function test_rational_time_inequality(Module) {
    // Test inequality
    const neq1 = new Module.RationalTime(30.2);
    const neq2 = new Module.RationalTime(33.2);
    console.log(`Inequality test - neq1: ${neq1.value()}, neq2: ${neq2.value()}`);
    assert_and_throw(neq1.equals(neq2) === false, 'Different RationalTime objects should not be equal');
}

function test_rational_time_strict_equality(Module) {
    // Test strict equality
    const steq1 = new Module.RationalTime(30.2);
    const steq2 = new Module.RationalTime(30.2);
    const steq3 = new Module.RationalTime(60.4, 2.0);
    console.log(`Strict equality test - steq1: ${steq1.value()}, steq2: ${steq2.value()}, steq3: ${steq3.value()}`);
    assert_and_throw(steq1.strictly_equal(steq2) === true, 'Equal RationalTime objects should be strictly equal');
    assert_and_throw(steq1.strictly_equal(steq3) === false, 'Equal RationalTime objects with different rates should not be strictly equal');
}

function test_rational_time_rounding(Module) {
    // Test rounding
    const rt1 = new Module.RationalTime(30.2);
    const ex1 = new Module.RationalTime(30.0);
    const ex2 = new Module.RationalTime(31.0);

    console.log(`Rounding test - rt1: ${rt1.value()}`);
    assert_and_throw(rt1.floor().equals(ex1), 'Floor should be 30.0');
    assert_and_throw(rt1.ceil().equals(ex2), 'Ceil should be 31.0');
    assert_and_throw(rt1.round().equals(ex1), 'Round should be 30.0');

    const rt2 = new Module.RationalTime(30.8);
    assert_and_throw(rt2.floor().equals(ex1), 'Floor should be 30.0');
    assert_and_throw(rt2.ceil().equals(ex2), 'Ceil should be 31.0');
    assert_and_throw(rt2.round().equals(ex2), 'Round should be 31.0');
}

function test_rational_time_comparison(Module) {
    // Test comparison
    const cmp1 = new Module.RationalTime(15.2);
    const cmp2 = new Module.RationalTime(15.6);
    console.log(`Comparison test - cmp1: ${cmp1.value()}, cmp2: ${cmp2.value()}`);
    assert_and_throw(cmp1.less_than(cmp2) === true, 'RationalTime objects with value 15.2 should be less than 15.6');
    assert_and_throw(cmp1.less_than_or_equal(cmp2) === true, 'RationalTime objects with value 15.2 should be less than or equal to 15.6');
    assert_and_throw(cmp1.greater_than(cmp2) === false, 'RationalTime objects with value 15.2 should not be greater than 15.6');
    assert_and_throw(cmp1.greater_than_or_equal(cmp2) === false, 'RationalTime objects with value 15.2 should not be greater than or equal to 15.6');

    const cmp3 = new Module.RationalTime(30.4, 2);
    assert_and_throw(cmp1.less_than_or_equal(cmp3) === true, 'RationalTime objects with value 15.2 should be less than or equal to 30.4/2');
    assert_and_throw(cmp1.greater_than_or_equal(cmp3) === true, 'RationalTime objects with value 15.2 should be greater than or equal to 30.4/2');
    assert_and_throw(cmp3.less_than_or_equal(cmp1) === true, 'RationalTime objects with value 30.4/2 should be less than or equal to 15.2');
    assert_and_throw(cmp3.greater_than_or_equal(cmp1) === true, 'RationalTime objects with value 30.4/2 should be greater than or equal to 15.2');

    const cmp4 = new Module.RationalTime(15.6, 48);
    assert_and_throw(cmp1.greater_than(cmp4) === true, 'RationalTime objects with value 15.2 should be greater than 15.6/48');
    assert_and_throw(cmp1.greater_than_or_equal(cmp4) === true, 'RationalTime objects with value 15.2 should be greater than or equal to 15.6/48');
    assert_and_throw(cmp1.less_than(cmp4) === false, 'RationalTime objects with value 15.6/48 should not be less than 15.2');
    assert_and_throw(cmp1.less_than_or_equal(cmp4) === false, 'RationalTime objects with value 15.6/48 should not be less than or equal to 15.2');
}

function test_rational_time_base_conversion(Module) {
    // Test base conversion
    const rt1 = new Module.RationalTime(10, 24);
    const rt2 = rt1.rescaled_to(48);
    console.log(`Base converstion test rt1: ${rt1.rate()}, rt2: ${rt2.rate()}`);
    assert_and_throw(rt1.rate() === 24, 'Rate should be 24');
    assert_and_throw(rt2.rate() === 48, 'Rate should be 48');
}

function test_timecode_conversion(Module) {
    const timecode = "00:06:56:17";
    const t = Module.RationalTime.from_timecode(timecode, 24);
    console.log(`Timecode conversion test t: ${t.value()}`);
    assert_and_throw(t.to_timecode() === timecode, 'Timecode should be 00:06:56:17');
}

function test_negative_timecode(Module) {
    const timecode = "-01:00:13:13";
    let caught = false;
    try {
        const t = Module.RationalTime.from_timecode(timecode, 24);
    } catch (error) {
        caught = true;
    }
    assert_and_throw(caught, 'Negative timecode should throw an error');
}

function test_timecode_24(Module) {
    const timecode1 = "00:00:01:00";
    const t1 = Module.RationalTime.from_timecode(timecode1, 24);
    const ex1 = new Module.RationalTime(24, 24);
    console.log(`Timecode 24 test t1: ${t1.value()}`);
    assert_and_throw(t1.equals(ex1), 'Timecode should be 00:00:01:00');

    const timecode2 = "00:01:00:00";
    const t2 = Module.RationalTime.from_timecode(timecode2, 24);
    const ex2 = new Module.RationalTime(24 * 60, 24);
    console.log(`Timecode 24 test t2: ${t2.value()}`);
    assert_and_throw(t2.equals(ex2), 'Timecode should be 00:01:00:00');

    const timecode3 = "01:00:00:00";
    const t3 = Module.RationalTime.from_timecode(timecode3, 24);
    const ex3 = new Module.RationalTime(24 * 60 * 60, 24);
    console.log(`Timecode 24 test t3: ${t3.value()}`);
    assert_and_throw(t3.equals(ex3), 'Timecode should be 01:00:00:00');

    const timecode4 = "24:00:00:00";
    const t4 = Module.RationalTime.from_timecode(timecode4, 24);
    const ex4 = new Module.RationalTime(24 * 60 * 60 * 24, 24);
    console.log(`Timecode 24 test t4: ${t4.value()}`);
    assert_and_throw(t4.equals(ex4), 'Timecode should be 24:00:00:00');

    const timecode5 = "23:59:59:23"; 
    const t5 = Module.RationalTime.from_timecode(timecode5, 24);
    const ex5 = new Module.RationalTime(24 * 60 * 60 * 24 - 1, 24);
    console.log(`Timecode 24 test t5: ${t5.value()}`);
    assert_and_throw(t5.equals(ex5), 'Timecode should be 23:59:59:23');
}

// Function to test the OpenTime module
async function testOpenTime() {
    console.log('Testing OpenTime bindings...');
    
    try {
        // Load the OpenTime module
        const OpenTimeModule = require('../build-wasm/src/ts-opentimelineio/opentime-bindings/opentime.js');
        
        // Initialize the module
        const Module = await OpenTimeModule();
        
        console.log('✅ OpenTime module loaded successfully');
        
        // Test RationalTime class
        console.log('\n--- Testing RationalTime ---');
        
        test_rational_time_constructor(Module);
        test_rational_time_validity(Module);
        test_rational_time_equality(Module);
        test_rational_time_inequality(Module);
        test_rational_time_strict_equality(Module);
        test_rational_time_rounding(Module);
        test_rational_time_comparison(Module);
        test_rational_time_base_conversion(Module);
        test_timecode_conversion(Module);
        test_negative_timecode(Module);
        test_timecode_24(Module);

        console.log('✅ All OpenTime tests passed!');
        
    } catch (error) {
        console.error('❌ Error testing OpenTime bindings:', error);
        process.exit(1);
    }
}

// Function to test the OpenTimelineIO module
async function testOpenTimelineIO() {
    console.log('\nTesting OpenTimelineIO bindings...');
    
    try {
        // Load the OpenTimelineIO module
        const OpenTimelineIOModule = require('../build-wasm/src/ts-opentimelineio/opentimelineio-bindings/opentimelineio.js');
        
        // Initialize the module
        const Module = await OpenTimelineIOModule();
        
        console.log('✅ OpenTimelineIO module loaded successfully');
        console.log('✅ Module is ready for testing (add your OTIO-specific tests here)');
        
    } catch (error) {
        console.error('❌ Error testing OpenTimelineIO bindings:', error);
    }
}

// Run the tests
async function runTests() {
    console.log('🚀 Starting OpenTimelineIO JavaScript Bindings Tests\n');
    
    await testOpenTime();
    await testOpenTimelineIO();
    
    console.log('\n🎉 Test run completed!');
}

// Execute tests if this file is run directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testOpenTime, testOpenTimelineIO }; 