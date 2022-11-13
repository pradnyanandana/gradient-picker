<script>
import Prism from "prismjs";
import "prismjs/themes/prism.css";
export default {
    data() {
        return {
            //
        };
    },
    // mounted
    mounted() {
        window.Prism = window.Prism || {};
        window.Prism.manual = true;
        Prism.highlightAll(); // highlight your code on mount
    }
};
</script>

<template>
    <main>
        <h1 class="site-title">Gradient Picker</h1>
        <div class="gradient-picker">
            <div class="gpi-type-options">
            </div>
            <div class="gpi-gradient">
                <div class="gpi-gradient-bar">
                    <div class="gpi-gradient-bar-background"></div>
                    <div class="gpi-gradient-bar-pointer">
                        <div class="pointer">
                            <div class="pointer-color">
                                <div class="pointer-color-transparent"></div>
                                <div class="pointer-color-inner"></div>
                            </div>
                            <div class="pointer-arrow"></div>
                            <div class="pointer-arrow-inner"></div>
                        </div>
                        <div class="pointer">
                            <div class="pointer-color">
                                <div class="pointer-color-transparent"></div>
                                <div class="pointer-color-inner"></div>
                            </div>
                            <div class="pointer-arrow"></div>
                            <div class="pointer-arrow-inner"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gpi-picker">
                <div class="pointer"></div>
                <div class="bg1"></div>
                <div class="bg2"></div>
            </div>
            <div class="gpi-preview-area">
                <div class="gpi-preview">
                    <div class="gpi-preview-transparent"></div>
                    <div class="gpi-preview-background"></div>
                </div>
                <div class="gpi-hue-alpha">
                    <div class="gpi-hue">
                        <div class="pointer"></div>
                    </div>
                    <div class="gpi-alpha">
                        <div class="pointer"></div>
                        <div class="bg"></div>
                    </div>
                </div>
            </div>
            <div class="gpi-hex">
                <span class="gpi-hex-title">#FFFFFF</span>
                <div class="gpi-hex-input">
                    <input type="text" class="gpi-hex-input-value" />
                    <span class="gpi-hex-input-percent">%</span>
                </div>
            </div>
            <div class="gpi-saved-button">
                <button>Save Color</button>
            </div>
            <div class="gpi-saved-colors">
                <p>Saved Colors</p>
                <div class="saved-items">
                    <div class="saved-item"></div>
                    <div class="saved-item"></div>
                    <div class="saved-item"></div>
                    <div class="saved-item"></div>
                    <div class="saved-item"></div>
                </div>
            </div>
            <div class="gpi-generated-code">
                <p>Generated Code</p>
                <pre><code class="language-css">background-color: -webkit-linear-gradient(127deg, #40c9ff, #e81cff);</code></pre>
            </div>
        </div>
    </main>
</template>

<style scoped>

</style>
